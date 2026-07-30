"""
documents/urls.py

URL patterns for document management.
All routes start with /api/documents/
"""

from django.urls import path
from .views import (
    DocumentListView,
    DocumentUploadView,
    DocumentDeleteView,
    DocumentStatusView
)

urlpatterns = [
    # GET /api/documents/ → List all documents
    path('', DocumentListView.as_view(), name='document-list'),

    # POST /api/documents/upload/ → Upload a new document
    path('upload/', DocumentUploadView.as_view(), name='document-upload'),

    # DELETE /api/documents/<id>/ → Delete a document
    path('<int:pk>/', DocumentDeleteView.as_view(), name='document-delete'),

    # GET /api/documents/<id>/status/ → Check processing status
    path('<int:pk>/status/', DocumentStatusView.as_view(), name='document-status'),
]
