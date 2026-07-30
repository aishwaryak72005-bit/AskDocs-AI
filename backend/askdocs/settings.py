"""
askdocs/settings.py

Main Django configuration file.
All settings for the AskDocs AI backend are defined here.
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ============================================================
# BASE DIRECTORY
# ============================================================
# This is the root folder of the backend project
BASE_DIR = Path(__file__).resolve().parent.parent


# ============================================================
# SECURITY SETTINGS
# ============================================================
# Secret key — keep this secret in production!
SECRET_KEY = os.getenv('SECRET_KEY', 'askdocs-super-secret-key-2024-bca-project')

# Debug mode — set to False in production
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

# Allowed hosts (accepts Render domain or wildcard)
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')


# ============================================================
# INSTALLED APPS
# ============================================================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',                   # Django REST Framework
    'rest_framework_simplejwt',         # JWT Authentication
    'rest_framework_simplejwt.token_blacklist',  # For logout (blacklist tokens)
    'corsheaders',                      # Allow React frontend to connect

    # Our custom apps
    'authentication',
    'documents',
    'chat',
]

# ============================================================
# MIDDLEWARE
# ============================================================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',            # CORS must be first
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',       # Serve static files in production
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'askdocs.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'askdocs.wsgi.application'


# ============================================================
# DATABASE - MySQL / Cloud Database URL
# ============================================================
import dj_database_url

DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL:
    # Clean up ssl-mode query parameter for PyMySQL compatibility
    cleaned_url = DATABASE_URL.replace('?ssl-mode=REQUIRED', '').replace('&ssl-mode=REQUIRED', '')
    
    db_config = dj_database_url.config(
        default=cleaned_url,
        conn_max_age=600,
        ssl_require=False
    )

    # Remove any ssl-mode keys from OPTIONS
    if 'OPTIONS' in db_config:
        db_config['OPTIONS'].pop('ssl-mode', None)
        db_config['OPTIONS'].pop('ssl_mode', None)
        db_config['OPTIONS']['charset'] = 'utf8mb4'
    else:
        db_config['OPTIONS'] = {'charset': 'utf8mb4'}

    DATABASES = {
        'default': db_config
    }
else:
    # Local MySQL Database
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': os.getenv('DB_NAME', 'askdocs_db'),
            'USER': os.getenv('DB_USER', 'root'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '3306'),
            'OPTIONS': {
                'charset': 'utf8mb4',
            }
        }
    }


# ============================================================
# PASSWORD VALIDATION
# ============================================================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ============================================================
# INTERNATIONALIZATION
# ============================================================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'     # Indian Standard Time
USE_I18N = True
USE_TZ = True


# ============================================================
# STATIC & MEDIA FILES
# ============================================================
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files — uploaded documents are stored here
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ============================================================
# CORS SETTINGS
# ============================================================
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_CREDENTIALS = True


# ============================================================
# REST FRAMEWORK SETTINGS
# ============================================================
REST_FRAMEWORK = {
    # Use JWT tokens for all API authentication by default
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    # All endpoints require login by default
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}


# ============================================================
# JWT SETTINGS
# ============================================================
SIMPLE_JWT = {
    # Access token lasts 1 day
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    # Refresh token lasts 7 days
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    # Generate a new refresh token on each use
    'ROTATE_REFRESH_TOKENS': True,
    # Blacklist old refresh tokens (needed for logout)
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}


# ============================================================
# GEMINI API KEY
# ============================================================
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')


# ============================================================
# FILE UPLOAD SETTINGS
# ============================================================
# Maximum upload size: 20 MB (in bytes)
MAX_UPLOAD_SIZE = 20 * 1024 * 1024  # 20 MB

# Allowed file extensions
ALLOWED_DOCUMENT_TYPES = ['pdf', 'docx', 'txt']

# FAISS index files will be stored in this folder
VECTOR_STORE_DIR = BASE_DIR / 'vector_stores'
