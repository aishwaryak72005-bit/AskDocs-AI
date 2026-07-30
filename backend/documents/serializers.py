"""
documents/serializers.py

Serializers for the Document model.
Converts Document objects to JSON for the API responses.
"""

from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for displaying document information.
    Used in list and detail API responses.
    """

    # Add a human-readable file size (e.g., "2.4 MB") computed field
    file_size_display = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id',
            'title',
            'file_type',
            'file_size',
            'file_size_display',
            'status',
            'error_message',
            'uploaded_at',
        ]
        # Never expose the file path or vector store path to frontend
        read_only_fields = ['id', 'status', 'uploaded_at']

    def get_file_size_display(self, obj):
        """Convert bytes to human-readable format (KB, MB)."""
        size = obj.file_size

        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.1f} KB"
        else:
            return f"{size / (1024 * 1024):.1f} MB"


class DocumentUploadSerializer(serializers.Serializer):
    """
    Serializer for accepting file uploads.
    Validates file type and size before saving.
    """
    file = serializers.FileField()

    def validate_file(self, file):
        """
        Validate the uploaded file:
        1. Check file extension (pdf, docx, txt only)
        2. Check file size (max 20 MB)
        """
        # Get file extension
        filename = file.name.lower()
        if '.' not in filename:
            raise serializers.ValidationError("File must have an extension.")

        ext = filename.rsplit('.', 1)[-1]

        # Check allowed types
        allowed = ['pdf', 'docx', 'txt']
        if ext not in allowed:
            raise serializers.ValidationError(
                f"Unsupported file type '.{ext}'. Allowed types: PDF, DOCX, TXT"
            )

        # Check file size (20 MB limit)
        max_size = 20 * 1024 * 1024  # 20 MB in bytes
        if file.size > max_size:
            raise serializers.ValidationError(
                f"File too large ({file.size / (1024*1024):.1f} MB). Maximum allowed size is 20 MB."
            )

        return file
