"""
askdocs/wsgi.py

WSGI config for AskDocs AI.
This file is used by web servers (like Gunicorn on Render) to serve the app.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'askdocs.settings')

application = get_wsgi_application()
