"""
chat/serializers.py

Serializers for the ChatHistory model.
"""

from rest_framework import serializers
from .models import ChatHistory


class ChatHistorySerializer(serializers.ModelSerializer):
    """
    Serializer to display chat history entries.
    Includes the document title for easy reference.
    """

    # Show the document title (not just the ID)
    document_title = serializers.CharField(source='document.title', read_only=True)
    document_id = serializers.IntegerField(source='document.id', read_only=True)

    class Meta:
        model = ChatHistory
        fields = [
            'id',
            'document_id',
            'document_title',
            'question',
            'answer',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
