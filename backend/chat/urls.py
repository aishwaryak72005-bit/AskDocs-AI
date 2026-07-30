"""
chat/urls.py

URL patterns for the chat app.
All routes start with /api/chat/
"""

from django.urls import path
from .views import (
    AskQuestionView,
    ChatHistoryListView,
    DocChatHistoryView,
    DeleteChatView
)

urlpatterns = [
    # POST /api/chat/ask/ → Ask a question about a document
    path('ask/', AskQuestionView.as_view(), name='ask-question'),

    # GET /api/chat/history/ → Get all chat history
    path('history/', ChatHistoryListView.as_view(), name='chat-history'),

    # GET /api/chat/history/<doc_id>/ → History for one document
    path('history/<int:doc_id>/', DocChatHistoryView.as_view(), name='doc-chat-history'),

    # DELETE /api/chat/history/<id>/ → Delete a chat entry
    path('history/delete/<int:pk>/', DeleteChatView.as_view(), name='delete-chat'),
]
