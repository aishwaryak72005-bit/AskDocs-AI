"""
chat/views.py

API views for the chat functionality:
  - AskQuestionView      → POST /api/chat/ask/              → Ask a question
  - ChatHistoryListView  → GET  /api/chat/history/          → All history
  - DocChatHistoryView   → GET  /api/chat/history/<doc_id>/ → History for one doc
  - DeleteChatView       → DELETE /api/chat/history/<id>/   → Delete a chat entry
"""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from documents.models import Document
from .models import ChatHistory
from .serializers import ChatHistorySerializer
from utils.rag_helper import get_answer_from_document  # We'll create this next


class AskQuestionView(APIView):
    """
    Endpoint: POST /api/chat/ask/
    Access: Authenticated users only

    Request body:
    {
        "document_id": 1,
        "question": "What is the main topic of this document?"
    }

    Steps:
    1. Validate the request (document exists, belongs to user, is ready)
    2. Use RAG to find relevant document chunks
    3. Send chunks + question to Gemini
    4. Save Q&A to database
    5. Return the answer
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        document_id = request.data.get('document_id')
        question = request.data.get('question', '').strip()

        # Validate inputs
        if not document_id:
            return Response({
                'error': 'Please select a document to ask questions about.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not question:
            return Response({
                'error': 'Please enter a question.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Find the document — must belong to this user
        try:
            document = Document.objects.get(id=document_id, user=request.user)
        except Document.DoesNotExist:
            return Response({
                'error': 'Document not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Check if document is ready
        if document.status == Document.STATUS_PENDING:
            return Response({
                'error': 'This document is still being uploaded. Please wait.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if document.status == Document.STATUS_PROCESSING:
            return Response({
                'error': 'This document is still being processed. Please wait a moment.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if document.status == Document.STATUS_FAILED:
            return Response({
                'error': f'Document processing failed: {document.error_message or "Unknown error"}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # -------------------------------------------------------
        # Get AI answer using RAG
        # This function will:
        # 1. Load the FAISS index for this document
        # 2. Find relevant chunks for the question
        # 3. Send chunks to Gemini
        # 4. Return the answer
        # -------------------------------------------------------
        try:
            answer = get_answer_from_document(
                vector_store_path=document.vector_store_path,
                question=question
            )
        except Exception as e:
            # Print exact error to terminal for debugging
            print(f"❌ CHAT ERROR: {type(e).__name__}: {str(e)}")

            error_str = str(e).lower()

            if 'quota' in error_str or 'rate' in error_str:
                return Response({
                    'error': 'The AI service is temporarily unavailable due to quota limits. Please try again later.'
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            return Response({
                'error': f'AI Service Error: {str(e)[:150]}'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # Save this Q&A to the database
        chat_entry = ChatHistory.objects.create(
            user=request.user,
            document=document,
            question=question,
            answer=answer
        )

        return Response({
            'answer': answer,
            'chat_id': chat_entry.id,
            'document_title': document.title
        }, status=status.HTTP_200_OK)


class ChatHistoryListView(APIView):
    """
    Endpoint: GET /api/chat/history/
    Access: Authenticated users only

    Returns all chat history for the logged-in user.
    Ordered by newest first.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        history = ChatHistory.objects.filter(user=request.user)
        serializer = ChatHistorySerializer(history, many=True)

        return Response({
            'history': serializer.data,
            'total': history.count()
        }, status=status.HTTP_200_OK)


class DocChatHistoryView(APIView):
    """
    Endpoint: GET /api/chat/history/<doc_id>/
    Access: Authenticated users only

    Returns chat history for a specific document.
    Useful for showing past conversations in the chat page.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, doc_id):
        # Make sure the document belongs to this user
        try:
            document = Document.objects.get(id=doc_id, user=request.user)
        except Document.DoesNotExist:
            return Response({
                'error': 'Document not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        history = ChatHistory.objects.filter(
            user=request.user,
            document=document
        )
        serializer = ChatHistorySerializer(history, many=True)

        return Response({
            'document_title': document.title,
            'history': serializer.data
        }, status=status.HTTP_200_OK)


class DeleteChatView(APIView):
    """
    Endpoint: DELETE /api/chat/history/<id>/
    Access: Authenticated users only

    Deletes a specific chat history entry.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            chat_entry = ChatHistory.objects.get(id=pk, user=request.user)
            chat_entry.delete()

            return Response({
                'message': 'Chat entry deleted.'
            }, status=status.HTTP_200_OK)

        except ChatHistory.DoesNotExist:
            return Response({
                'error': 'Chat entry not found.'
            }, status=status.HTTP_404_NOT_FOUND)
