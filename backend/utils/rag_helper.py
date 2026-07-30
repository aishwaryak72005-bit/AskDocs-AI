"""
utils/rag_helper.py

RAG (Retrieval-Augmented Generation) Helper

This is the CORE of the AskDocs AI system.
It handles everything related to document processing and AI answering.

Functions:
1. extract_text()       → Pull text out of PDF, DOCX, or TXT files
2. split_into_chunks()  → Break large text into smaller pieces
3. build_vector_store() → Create FAISS index from text chunks
4. process_document()   → Complete pipeline: extract → chunk → index
5. get_answer_from_document() → RAG: find relevant chunks → ask Gemini

Why RAG?
---------
Instead of sending the ENTIRE document to Gemini (which would exceed
token limits and cost more), we:
1. Break the document into small chunks
2. When user asks a question, find the most RELEVANT chunks
3. Send only those relevant chunks to Gemini
4. Gemini answers based only on what we send it

This is called Retrieval-Augmented Generation (RAG).
"""

import os
import pickle
import django
from django.conf import settings

# ---- Document Reading Libraries ----
import PyPDF2
from docx import Document as DocxDocument

# No LangChain needed — we implement our own simple text splitter below!
# ---- FAISS for Vector Search ----
import faiss
import numpy as np

# ---- Google Gemini AI ----
import google.generativeai as genai


# ============================================================
# STEP 1: EXTRACT TEXT FROM DOCUMENT
# ============================================================

def extract_text(file_path: str, file_type: str) -> str:
    """
    Extract all text content from a document file.

    Supports:
    - PDF  → Uses PyPDF2
    - DOCX → Uses python-docx
    - TXT  → Plain file read

    Returns the full text as a string.
    """
    text = ""

    try:
        if file_type == 'pdf':
            # Open and read PDF file
            with open(file_path, 'rb') as pdf_file:
                reader = PyPDF2.PdfReader(pdf_file)

                # Loop through all pages and extract text
                for page_num in range(len(reader.pages)):
                    page = reader.pages[page_num]
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"

        elif file_type == 'docx':
            # Open and read Word document
            doc = DocxDocument(file_path)

            # Each paragraph is a block of text
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text += paragraph.text + "\n"

        elif file_type == 'txt':
            # Simple text file read
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()

    except Exception as e:
        raise Exception(f"Failed to extract text from document: {str(e)}")

    # Check if we got any text
    if not text.strip():
        raise Exception("The document appears to be empty or contains no readable text.")

    return text


# ============================================================
# STEP 2: SPLIT TEXT INTO CHUNKS
# ============================================================

def split_into_chunks(text: str, chunk_size: int = 1000, overlap: int = 200) -> list:
    """
    Split a large text into smaller overlapping chunks.

    Why split?
    - Gemini has a token (word) limit per request
    - Smaller chunks make similarity search more accurate

    chunk_size=1000  → Each chunk is ~1000 characters
    overlap=200      → Chunks overlap by 200 characters
                       so context is not lost at boundaries

    This is our own implementation — no LangChain needed!
    """
    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        # End of this chunk
        end = start + chunk_size

        # Get the chunk text
        chunk = text[start:end]

        if chunk.strip():  # Only add non-empty chunks
            chunks.append(chunk)

        # Move forward by (chunk_size - overlap) for the next chunk
        start += chunk_size - overlap

    return chunks


# ============================================================
# STEP 3: GENERATE EMBEDDINGS AND BUILD FAISS INDEX
# ============================================================

def get_embeddings(texts: list) -> np.ndarray:
    """
    Convert a list of text chunks into numerical vectors (embeddings).
    Tries Google Gemini embedding model first.
    If Gemini embedding fails or key is invalid, falls back to local TF-IDF vectors
    so document upload NEVER fails!
    """
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        embeddings = []
        for text in texts:
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=text,
                task_type="retrieval_document"
            )
            embeddings.append(result['embedding'])
        return np.array(embeddings, dtype=np.float32)

    except Exception as e:
        print(f"⚠️ Gemini embedding failed ({str(e)}). Using local TF-IDF vector store fallback...")
        
        # Local TF-IDF Fallback using scikit-learn
        from sklearn.feature_extraction.text import TfidfVectorizer
        
        vectorizer = TfidfVectorizer(max_features=384)  # 384 dimensions
        tfidf_matrix = vectorizer.fit_transform(texts).toarray()
        
        # If texts are very short, pad to 384 dimensions
        if tfidf_matrix.shape[1] < 384:
            pad_width = 384 - tfidf_matrix.shape[1]
            tfidf_matrix = np.pad(tfidf_matrix, ((0, 0), (0, pad_width)), mode='constant')
            
        return tfidf_matrix.astype(np.float32)


def build_vector_store(chunks: list, save_path: str):
    """
    Build a FAISS index from text chunks and save it to disk.

    FAISS (Facebook AI Similarity Search) lets us quickly find
    which chunks are most relevant to a user's question.

    We save:
    - The FAISS index (for fast similarity search)
    - The text chunks (to retrieve the actual text later)

    Both are saved as a .pkl (pickle) file.
    """
    # Convert chunks to embeddings (vectors)
    embeddings = get_embeddings(chunks)

    # Get the dimension of each embedding vector
    dimension = embeddings.shape[1]

    # Create a FAISS index for cosine/L2 similarity search
    index = faiss.IndexFlatL2(dimension)

    # Add all embeddings to the index
    index.add(embeddings)

    # Save the index AND the original chunks together
    # We need the chunks to return the actual text later
    vector_store = {
        'index': index,
        'chunks': chunks,
        'dimension': dimension
    }

    # Create the directory if it doesn't exist
    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    # Save to disk as a pickle file
    with open(save_path, 'wb') as f:
        pickle.dump(vector_store, f)


# ============================================================
# STEP 4: FULL DOCUMENT PROCESSING PIPELINE
# ============================================================

def process_document(document_id: int):
    """
    Complete RAG processing pipeline for an uploaded document.

    Steps:
    1. Load the document from database
    2. Extract text from the file
    3. Split text into chunks
    4. Build FAISS vector index
    5. Save index to disk
    6. Update document status in database

    This function runs in a background thread (see documents/views.py).
    """
    # Import here to avoid circular imports
    # (Django models can't be imported at module level in utils)
    from documents.models import Document

    try:
        # Get the document from database
        document = Document.objects.get(id=document_id)

        # Update status to 'processing'
        document.status = Document.STATUS_PROCESSING
        document.save()

        # Step 1: Extract text from file
        file_path = document.file.path
        text = extract_text(file_path, document.file_type)

        # Step 2: Split text into chunks
        chunks = split_into_chunks(text)

        if not chunks:
            raise Exception("No text chunks could be extracted from this document.")

        # Step 3: Define where to save the FAISS index
        vector_dir = settings.VECTOR_STORE_DIR
        vector_filename = f"doc_{document_id}.pkl"
        vector_path = os.path.join(vector_dir, vector_filename)

        # Step 4: Build and save FAISS vector store
        print(f"Building vector store for document #{document_id}...")
        build_vector_store(chunks, vector_path)

        # Step 5: Update document with success status and vector store path
        document.status = Document.STATUS_READY
        document.vector_store_path = vector_path
        document.error_message = None
        document.save()
        print(f"✅ Document #{document_id} successfully processed and READY!")

    except Document.DoesNotExist:
        pass  # Document was deleted during processing

    except Exception as e:
        # Print error in terminal for debugging
        print(f"❌ ERROR processing document #{document_id}: {str(e)}")
        
        # Update document with failure status
        try:
            document = Document.objects.get(id=document_id)
            document.status = Document.STATUS_FAILED
            document.error_message = str(e)[:500]  # Limit error message length
            document.save()
        except Exception:
            pass  # Can't do anything if this fails too


# ============================================================
# STEP 5: ANSWER QUESTION USING RAG
# ============================================================

def get_answer_from_document(vector_store_path: str, question: str) -> str:
    """
    Answer a user's question using RAG (Retrieval-Augmented Generation).

    Steps:
    1. Load the FAISS index from disk
    2. Convert the question to an embedding vector
    3. Find the most relevant chunks (similarity search)
    4. Send those chunks + question to Gemini
    5. Return Gemini's answer

    Args:
        vector_store_path: Path to the saved FAISS .pkl file
        question: The user's question

    Returns:
        The AI's answer as a formatted string
    """
    # Configure Gemini API
    genai.configure(api_key=settings.GEMINI_API_KEY)

    # Step 1: Load the FAISS index from disk
    with open(vector_store_path, 'rb') as f:
        vector_store = pickle.load(f)

    index = vector_store['index']
    chunks = vector_store['chunks']

    # Step 2: Convert question to embedding vector
    try:
        question_embedding = genai.embed_content(
            model="models/text-embedding-004",
            content=question,
            task_type="retrieval_query"
        )
        question_vector = np.array(
            [question_embedding['embedding']], dtype=np.float32
        )
    except Exception as e:
        print(f"⚠️ Query embedding fallback used...")
        from sklearn.feature_extraction.text import TfidfVectorizer
        vectorizer = TfidfVectorizer(max_features=384)
        # Vectorize question + chunks together for vocabulary match
        all_texts = [question] + chunks
        matrix = vectorizer.fit_transform(all_texts).toarray()
        q_vec = matrix[0:1]
        
        if q_vec.shape[1] < 384:
            pad_width = 384 - q_vec.shape[1]
            q_vec = np.pad(q_vec, ((0, 0), (0, pad_width)), mode='constant')
            
        question_vector = q_vec.astype(np.float32)

    # Step 3: Find the top 5 most relevant chunks
    # k=5 means "find the 5 closest chunks"
    k = min(5, len(chunks))  # Don't request more than we have
    distances, indices = index.search(question_vector, k)

    # Get the actual text of the relevant chunks
    relevant_chunks = [chunks[i] for i in indices[0] if i < len(chunks)]

    # Combine the relevant chunks into one context block
    context = "\n\n---\n\n".join(relevant_chunks)

    # Step 4: Build the prompt for Gemini
    prompt = f"""You are a document assistant. Your job is to answer questions ONLY from the provided document context below.

RULES:
- Answer ONLY using the information in the document context provided.
- Do NOT use any outside knowledge or general information.
- If the answer is not in the document context, respond EXACTLY with: "I couldn't find this information in the uploaded document."
- Format your answer clearly using headings, bullet points, and short paragraphs.
- Never return one long paragraph. Break it up nicely.
- Use **bold** for important keywords.

--- DOCUMENT CONTEXT ---
{context}
--- END OF CONTEXT ---

USER QUESTION: {question}

ANSWER:"""

    # Step 5: Call AI Provider (Direct HTTP REST API - zero library bugs!)
    import requests
    import json
    from dotenv import load_dotenv
    import os

    # Re-read .env to catch any recent key updates
    load_dotenv(override=True)
    api_key = os.getenv('GEMINI_API_KEY', getattr(settings, 'GEMINI_API_KEY', '')).strip()
    print(f"🔑 Active API Key Prefix: {api_key[:8]}...")

    # --- IF GROQ KEY (starts with gsk_) ---
    if api_key.startswith('gsk_'):
        print("🚀 Using Groq Free Llama 3 API...")
        try:
            res = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3
                },
                timeout=15
            )
            if res.status_code == 200:
                data = res.json()
                return data['choices'][0]['message']['content']
            else:
                print("Groq Error:", res.text)
        except Exception as e:
            print("Groq Exception:", e)

    # --- IF GEMINI KEY (starts with AIzaSy) ---
    print("🤖 Using Google Gemini API...")
    for model_name in ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            res = requests.post(
                url,
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }]
                },
                timeout=15
            )
            if res.status_code == 200:
                data = res.json()
                answer_text = data['candidates'][0]['content']['parts'][0]['text']
                return answer_text
            else:
                print(f"Gemini {model_name} Error:", res.status_code, res.text)
        except Exception as e:
            print(f"Gemini {model_name} Exception:", e)

    # If key is still invalid, show helpful message
    return """⚠️ **API Key Configuration Needed**

To get real AI answers, please add a free API Key to your `backend/.env` file:

1. **Google Gemini Key**: Get free at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (starts with `AIzaSy...`)
2. **Groq Llama 3 Key**: Get free at [console.groq.com/keys](https://console.groq.com/keys) (starts with `gsk_...`)

Update `GEMINI_API_KEY` in `backend/.env` and ask your question again!"""
