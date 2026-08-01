"""
authentication/views.py

API views for user authentication:
  - RegisterView   → POST /api/auth/register/
  - LoginView      → POST /api/auth/login/
  - LogoutView     → POST /api/auth/logout/
  - UserView       → GET  /api/auth/user/

Each view handles an HTTP request and returns a JSON response.
"""

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import RegisterSerializer, UserSerializer


class RegisterView(APIView):
    """
    Endpoint: POST /api/auth/register/
    Access: Public (no login needed)

    Registers a new user with name, email, and password.
    Returns JWT tokens after successful registration.
    """
    permission_classes = [AllowAny]  # Anyone can access this

    def post(self, request):
        try:
            # Pass the request data to the serializer for validation
            serializer = RegisterSerializer(data=request.data)

            if serializer.is_valid():
                # Create the new user
                user = serializer.save()

                # Generate JWT tokens for the new user
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)

                return Response({
                    'message': 'Account created successfully!',
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'access': access_token,
                        'refresh': str(refresh),
                    }
                }, status=status.HTTP_201_CREATED)

            # If validation fails, return the errors
            return Response({
                'error': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"❌ REGISTER ERROR: {type(e).__name__}: {str(e)}")
            return Response({
                'error': f'Registration failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    """
    Endpoint: POST /api/auth/login/
    Access: Public (no login needed)

    Authenticates user with email and password.
    Returns JWT tokens on success.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            email = request.data.get('email', '').strip()
            password = request.data.get('password', '')

            # Basic validation
            if not email or not password:
                return Response({
                    'error': 'Email and password are required.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Find the user by email
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({
                    'error': 'No account found with this email.'
                }, status=status.HTTP_404_NOT_FOUND)

            # Check password
            if not user.check_password(password):
                return Response({
                    'error': 'Incorrect password. Please try again.'
                }, status=status.HTTP_401_UNAUTHORIZED)

            # Check if account is active
            if not user.is_active:
                return Response({
                    'error': 'Your account has been deactivated.'
                }, status=status.HTTP_403_FORBIDDEN)

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'message': 'Login successful!',
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"❌ LOGIN ERROR: {type(e).__name__}: {str(e)}")
            return Response({
                'error': f'Login failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LogoutView(APIView):
    """
    Endpoint: POST /api/auth/logout/
    Access: Authenticated users only

    Blacklists the refresh token so it can't be used again.
    This effectively logs the user out.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')

        if not refresh_token:
            return Response({
                'error': 'Refresh token is required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Blacklist the token (user can no longer use it)
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({
                'message': 'Logged out successfully.'
            }, status=status.HTTP_200_OK)

        except TokenError:
            return Response({
                'error': 'Invalid or expired token.'
            }, status=status.HTTP_400_BAD_REQUEST)


class UserView(APIView):
    """
    Endpoint: GET /api/auth/user/
    Access: Authenticated users only

    Returns the current logged-in user's information.
    Used by the frontend to display the user's name.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # request.user is automatically set by JWT middleware
        return Response({
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)
