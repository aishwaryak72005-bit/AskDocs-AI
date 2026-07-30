"""
documents/models.py

Database model for uploaded documents.

This model stores:
- Who uploaded the document (user)
- File details (name, type, size)
- Processing status (pending, ready, failed)
- Path to the FAISS vector store for this document
"""

import uuid
import os
from django.db import models
from django.contrib.auth.models import User


def document_upload_path(instance, filename):
    """
    Generate a unique upload path for each document.
    
    Format: documents/<user_id>/<uuid>/<original_filename>
    
    Why UUID?
    - Prevents filename conflicts if two users upload same file name
    - Adds security (files are not easily guessable)
    """
    ext = filename.rsplit('.', 1)[-1]          # Get file extension
    unique_name = f"{uuid.uuid4().hex}.{ext}"   # e.g., a1b2c3d4.pdf
    return os.path.join('documents', str(instance.user.id), unique_name)


class Document(models.Model):
    """
    Represents an uploaded document.
    
    Status values:
    - 'pending'  → File uploaded, processing not started yet
    - 'processing' → Extracting text and building FAISS index
    - 'ready'    → FAISS index built, user can ask questions
    - 'failed'   → Something went wrong during processing
    """

    # Status choices
    STATUS_PENDING = 'pending'
    STATUS_PROCESSING = 'processing'
    STATUS_READY = 'ready'
    STATUS_FAILED = 'failed'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_PROCESSING, 'Processing'),
        (STATUS_READY, 'Ready'),
        (STATUS_FAILED, 'Failed'),
    ]

    # Who uploaded this document
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,   # Delete documents when user is deleted
        related_name='documents'
    )

    # Original filename shown to the user (e.g., "resume.pdf")
    title = models.CharField(max_length=255)

    # The actual file stored in media/documents/
    file = models.FileField(upload_to=document_upload_path)

    # File type: 'pdf', 'docx', or 'txt'
    file_type = models.CharField(max_length=10)

    # File size in bytes
    file_size = models.PositiveIntegerField(default=0)

    # Processing status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING
    )

    # Path to the saved FAISS index (.pkl file) for this document
    # This is filled in after processing is complete
    vector_store_path = models.CharField(max_length=500, blank=True, null=True)

    # Error message if processing failed
    error_message = models.TextField(blank=True, null=True)

    # When was this document uploaded
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']  # Newest first

    def __str__(self):
        return f"{self.title} (by {self.user.email})"
