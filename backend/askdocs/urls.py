"""
askdocs/urls.py

Main URL configuration for AskDocs AI.
All API routes are registered here.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Django Admin Panel
    path('admin/', admin.site.urls),

    # Authentication APIs (register, login, logout)
    path('api/auth/', include('authentication.urls')),

    # Document APIs (upload, list, delete)
    path('api/documents/', include('documents.urls')),

    # Chat APIs (ask question, history)
    path('api/chat/', include('chat.urls')),
]

# Serve media files (uploaded documents) during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
