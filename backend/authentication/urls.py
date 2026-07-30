"""
authentication/urls.py

URL patterns for the authentication app.
All routes start with /api/auth/ (defined in askdocs/urls.py)
"""

from django.urls import path
from .views import RegisterView, LoginView, LogoutView, UserView

urlpatterns = [
    # POST /api/auth/register/ → Create a new account
    path('register/', RegisterView.as_view(), name='register'),

    # POST /api/auth/login/ → Login and get JWT tokens
    path('login/', LoginView.as_view(), name='login'),

    # POST /api/auth/logout/ → Logout (blacklist refresh token)
    path('logout/', LogoutView.as_view(), name='logout'),

    # GET /api/auth/user/ → Get current logged-in user info
    path('user/', UserView.as_view(), name='user'),
]
