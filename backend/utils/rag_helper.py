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
    Fast, lightweight 384-dim vectorizer optimized for instant processing on Render free tier.
    """
    import math

    # Calculate vocabulary frequencies across all chunks for TF-IDF embedding
    vocab = {}
    for text in texts:
        for word in text.lower().split():
            clean_word = ''.join(c for c in word if c.isalnum())
            if len(clean_word) > 2:
                vocab[clean_word] = vocab.get(clean_word, 0) + 1

    top_words = [w for w, _ in sorted(vocab.items(), key=lambda x: x[1], reverse=True)[:384]]
    word_to_idx = {w: i for i, w in enumerate(top_words)}

    embeddings = []
    for text in texts:
        vec = np.zeros(384, dtype=np.float32)
        words = [ ''.join(c for c in w if c.isalnum()) for w in text.lower().split() ]
        doc_len = max(1, len(words))
        
        for w in words:
            if w in word_to_idx:
                idx = word_to_idx[w]
                # TF-IDF weight calculation
                tf = words.count(w) / doc_len
                idf = math.log((len(texts) + 1) / (vocab.get(w, 1) + 1)) + 1
                vec[idx] = tf * idf
                
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        embeddings.append(vec)

    print(f"⚡ Instant vector store generated for {len(texts)} chunks!")
    return np.array(embeddings, dtype=np.float32)


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

    """
    import os
    import pickle

    # Step 1: Load the FAISS index from disk safely
    try:
        if not os.path.exists(vector_store_path):
            print(f"⚠️ Vector file missing: {vector_store_path}")
            return "I couldn't find the index for this document. Please re-upload the document."

        with open(vector_store_path, 'rb') as f:
            vector_store = pickle.load(f)

        index = vector_store['index']
        chunks = vector_store['chunks']
    except Exception as e:
        print(f"❌ Error loading vector store: {e}")
        return "Failed to load document content. Please try uploading the document again."

    # Step 2: Convert question to embedding vector
    import numpy as np
    question_vector = None

    # Normalize query (e.g., 'call back' -> 'callback' to catch space variations)
    normalized_question = question
    for spaced, joined in [("call back", "callback"), ("java script", "javascript"), ("front end", "frontend"), ("back end", "backend")]:
        if spaced in normalized_question.lower():
            normalized_question += f" {joined}"

    # Try sentence_transformers (free, local, no API key needed)
    try:
        from sentence_transformers import SentenceTransformer
        st_model = SentenceTransformer('all-MiniLM-L6-v2')
        q_emb = np.array(st_model.encode([normalized_question])[0], dtype=np.float32)
        index_dim = index.d
        # Resize embedding to match FAISS index dimension
        if len(q_emb) < index_dim:
            q_emb = np.pad(q_emb, (0, index_dim - len(q_emb)))
        elif len(q_emb) > index_dim:
            q_emb = q_emb[:index_dim]
        question_vector = np.array([q_emb], dtype=np.float32)
        print(f"✅ Query embedded with SentenceTransformer (dim={index_dim})")
    except Exception as e:
        print(f"⚠️ SentenceTransformer failed: {e}")

    # Fallback: keyword-based vector if embedding fails
    if question_vector is None:
        print("⚠️ Using keyword fallback embedding...")
        index_dim = index.d
        vec = np.zeros((1, index_dim), dtype=np.float32)
        words = question.lower().split()
        for i, word in enumerate(words[:index_dim]):
            vec[0, i % index_dim] += sum(ord(c) for c in word) % 100 / 100.0
        question_vector = vec

    # Step 3: Find the top 8 most relevant chunks
    k = min(8, len(chunks))
    distances, indices_result = index.search(question_vector, k)

    # Get the actual text of the relevant chunks (filter out invalid FAISS indices)
    relevant_chunks = [chunks[i] for i in indices_result[0] if 0 <= i < len(chunks)]

    # Combine the relevant chunks into one context block
    context = "\n\n---\n\n".join(relevant_chunks)

    # Step 4: Build the prompt
    prompt = f"""You are a helpful document assistant. Answer the user's question using ONLY the document context provided below. Do NOT show your thinking or reasoning steps — output the final answer directly.

Rules:
- Use ONLY information from the document context below.
- Do NOT use outside knowledge.
- If the answer is not found, say: "I couldn't find this information in the uploaded document."
- Format with **bold** keywords, bullet points, and short paragraphs.
- Never output your thinking process or intermediate steps — only the final answer.

=== DOCUMENT CONTEXT ===
{context}
=== END ===

Question: {question}

Final Answer (no thinking steps, direct response only):"""

    # Step 5: Call Groq Llama 3 REST API
    import requests
    import json
    from dotenv import load_dotenv
    import os

    # Load environment variables
    env_path = settings.BASE_DIR / '.env'
    if env_path.exists():
        load_dotenv(dotenv_path=env_path, override=True)

    raw_key = (os.getenv('GROQ_API_KEY') or os.getenv('GEMINI_API_KEY') or getattr(settings, 'GEMINI_API_KEY', '')).strip()
    api_key = raw_key.replace('"', '').replace("'", '').strip()

    # Extract clean Groq API key (starts with gsk_)
    groq_key = api_key
    if 'gsk_' in api_key:
        idx = api_key.find('gsk_')
        groq_key = api_key[idx:].split()[0].rstrip(';,.\'"').strip()

    print(f"🚀 Calling Groq API (Key: {groq_key[:12]}...)...")

    # Step 5a: Direct list of active Groq text/chat models
    groq_models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
    
    print(f"🎯 Querying Groq API using models: {groq_models}")

    for g_model in groq_models:
        try:
            res = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {groq_key}",
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                },
                json={
                    "model": g_model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3
                },
                timeout=4
            )
            print(f"📡 Groq [{g_model}] Status Code: {res.status_code}")
            if res.status_code == 200:
                data = res.json()
                answer = data['choices'][0]['message']['content']
                # Strip <think>...</think> blocks (for thinking models)
                import re
                answer = re.sub(r'<think>.*?</think>', '', answer, flags=re.DOTALL).strip()
                if '</think>' in answer:
                    answer = answer[answer.rfind('</think>') + len('</think>'):].strip()
                print(f"✅ Groq SUCCESS using {g_model}!")
                return answer
            else:
                print(f"❌ Groq [{g_model}] Error ({res.status_code}): {res.text[:150]}")
        except Exception as e:
            print(f"❌ Groq [{g_model}] Exception: {e}")

    # Fallback to local document extraction if offline
    print("⚠️ Groq API offline or rate-limited. Generating answer using local document summarizer...")
    
    q_words = set(w.lower() for w in question.split() if len(w) > 2)
    matched_paragraphs = []
    
    for chunk in relevant_chunks:
        paragraphs = [p.strip() for p in chunk.split('\n\n') if len(p.strip()) > 20]
        for p in paragraphs:
            clean_p = ' '.join(p.split())
            p_words = set(w.lower() for w in clean_p.split())
            score = len(q_words.intersection(p_words))
            if score > 0 or any(k in question.lower() for k in ['summary', 'key', 'what', 'explain', 'describe']):
                matched_paragraphs.append((score, clean_p))

    matched_paragraphs.sort(key=lambda x: x[0], reverse=True)
    top_paragraphs = list(dict.fromkeys([p[1] for p in matched_paragraphs[:3]]))

    if not top_paragraphs:
        return "I couldn't find relevant information in the uploaded document to answer this question."

    formatted_answer = "### Document Context Summary\n\n"
    for p in top_paragraphs:
        formatted_answer += f"{p.strip()}\n\n"

    return formatted_answer.strip()
