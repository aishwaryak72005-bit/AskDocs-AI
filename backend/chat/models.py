"""
chat/models.py

Database model for storing chat history.

Every question and answer is saved here so users can
review their past conversations.
"""

from django.db import models
from django.contrib.auth.models import User
from documents.models import Document


class ChatHistory(models.Model):
    """
    Stores a single question-answer pair from a chat session.

    Fields:
    - user        → Who asked the question
    - document    → Which document was used
    - question    → The user's question
    - answer      → The AI's answer
    - created_at  → When this chat happened
    """

    # Who asked the question
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='chat_history'
    )

    # Which document was used to answer this question
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='chat_history'
    )

    # The user's question
    question = models.TextField()

    # The AI's answer
    answer = models.TextField()

    # When this conversation happened
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']  # Newest first

    def __str__(self):
        return f"Q: {self.question[:50]}... (by {self.user.email})"
