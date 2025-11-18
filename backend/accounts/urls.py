from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView

from .views import (
    AdminLoginView,
    AdminTokenRefreshView,
    AdminDashboardView,
    ClientTokenRefreshView,
    CustomerProfileView,
    ForgotPasswordView,
    LoginView,
    RegisterView,
    ResetPasswordView,
    VerifyEmailView,
)

client_patterns = ([
    path('auth/register/', RegisterView.as_view(), name='client-auth-register'),
    path('auth/login/', LoginView.as_view(), name='client-auth-login'),
    path('auth/refresh/', ClientTokenRefreshView.as_view(), name='client-auth-refresh'),
    path('auth/token-verify/', TokenVerifyView.as_view(), name='client-auth-verify-token'),
    path('auth/verify-email/', VerifyEmailView.as_view(), name='client-auth-verify'),
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='client-auth-forgot'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='client-auth-reset'),
    path('me/', CustomerProfileView.as_view(), name='client-profile'),
], 'client-auth')

admin_patterns = ([
    path('auth/login/', AdminLoginView.as_view(), name='admin-auth-login'),
    path('auth/refresh/', AdminTokenRefreshView.as_view(), name='admin-auth-refresh'),
    path('auth/token-verify/', TokenVerifyView.as_view(), name='admin-auth-verify-token'),
    path('dashboard/summary/', AdminDashboardView.as_view(), name='admin-dashboard-summary'),
], 'admin-auth')
