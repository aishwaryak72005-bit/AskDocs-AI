"""
documents/views.py

API views for document management:
  - DocumentListView    → GET  /api/documents/         → List all documents
  - DocumentUploadView  → POST /api/documents/upload/  → Upload a document
  - DocumentDeleteView  → DELETE /api/documents/<id>/  → Delete a document
  - DocumentStatusView  → GET  /api/documents/<id>/status/ → Check status
"""

import threading
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Document
from .serializers import DocumentSerializer, DocumentUploadSerializer
from utils.rag_helper import process_document  # We'll create this in Step 5


class DocumentListView(APIView):
    """
    Endpoint: GET /api/documents/
    Access: Authenticated users only

    Returns a list of all documents uploaded by the logged-in user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get only this user's documents (not other users')
        documents = Document.objects.filter(user=request.user)
        serializer = DocumentSerializer(documents, many=True)

        return Response({
            'documents': serializer.data,
            'total': documents.count()
        }, status=status.HTTP_200_OK)


class DocumentUploadView(APIView):
    """
    Endpoint: POST /api/documents/upload/
    Access: Authenticated users only

    Steps:
    1. Validate the uploaded file (type, size)
    2. Save the file to media/
    3. Create a Document record in the database
    4. Start processing in background (extract text, build FAISS index)
    5. Return the document info immediately (processing happens in background)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Validate the uploaded file
        serializer = DocumentUploadSerializer(data=request.FILES)

        if not serializer.is_valid():
            return Response({
                'error': serializer.errors.get('file', ['Upload failed.'])[0]
            }, status=status.HTTP_400_BAD_REQUEST)

        file = serializer.validated_data['file']

        # Determine file type from extension
        file_type = file.name.rsplit('.', 1)[-1].lower()

        # Create the Document record in the database
        document = Document.objects.create(
            user=request.user,
            title=file.name,        # Original filename
            file=file,
            file_type=file_type,
            file_size=file.size,
            status=Document.STATUS_PENDING
        )

        # -------------------------------------------------------
        # Process the document in the background using a thread.
        # This way, the API responds immediately and the user
        # doesn't have to wait for text extraction & FAISS building.
        # -------------------------------------------------------
        thread = threading.Thread(
            target=process_document,
            args=(document.id,)
        )
        thread.daemon = True  # Thread stops if main app stops
        thread.start()

        return Response({
            'message': 'Document uploaded successfully! Processing has started.',
            'document': DocumentSerializer(document).data
        }, status=status.HTTP_201_CREATED)


class DocumentDeleteView(APIView):
    """
    Endpoint: DELETE /api/documents/<id>/
    Access: Authenticated users only

    Deletes a document and its associated vector store file.
    Only the owner can delete their own document.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        # Find the document — must belong to the logged-in user
        try:
            document = Document.objects.get(id=pk, user=request.user)
        except Document.DoesNotExist:
            return Response({
                'error': 'Document not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Delete the actual file from storage
        if document.file:
            try:
                import os
                if os.path.exists(document.file.path):
                    os.remove(document.file.path)
            except Exception:
                pass  # Don't fail if file is already missing

        # Delete the FAISS vector store file
        if document.vector_store_path:
            try:
                import os
                if os.path.exists(document.vector_store_path):
                    os.remove(document.vector_store_path)
            except Exception:
                pass

        # Delete the database record
        document.delete()

        return Response({
            'message': 'Document deleted successfully.'
        }, status=status.HTTP_200_OK)


class DocumentStatusView(APIView):
    """
    Endpoint: GET /api/documents/<id>/status/
    Access: Authenticated users only

    Returns the processing status of a document.
    Frontend polls this endpoint to know when document is ready.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            document = Document.objects.get(id=pk, user=request.user)
        except Document.DoesNotExist:
            return Response({
                'error': 'Document not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'id': document.id,
            'title': document.title,
            'status': document.status,
            'error_message': document.error_message
        }, status=status.HTTP_200_OK)
