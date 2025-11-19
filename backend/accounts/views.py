import logging
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView

from .email import EmailDeliveryError, send_password_reset_email, send_verification_email
from .models import Customer
from produtos.models import PedidoIntencao, Avaliacao, AllowedRating
from .serializers import (
    CustomerSerializer,
    EmailVerificationSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    TokenPairSerializer,
    UpdateCustomerSerializer,
)

logger = logging.getLogger(__name__)

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, token = serializer.save()
        email_failed = False
        try:
            send_verification_email(user, token)
        except EmailDeliveryError:
            logger.exception("Falha ao enviar e-mail de verificação para %s", user.email)
            email_failed = True

        detail = "Cadastro realizado. Confirme seu e-mail." if not email_failed else (
            "Cadastro realizado, mas não foi possível enviar o e-mail de confirmação. Tente novamente mais tarde."
        )
        status_code = status.HTTP_201_CREATED if not email_failed else status.HTTP_202_ACCEPTED
        return Response({"detail": detail}, status=status_code)


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        customer = serializer.save()
        token_data = TokenPairSerializer.generate_for_user(customer.user)
        return Response({"detail": "E-mail confirmado com sucesso.", **token_data})


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        if hasattr(user, "customer_profile") and not user.customer_profile.email_verified:
            return Response({"detail": "E-mail ainda não confirmado."}, status=status.HTTP_403_FORBIDDEN)
        token_data = TokenPairSerializer.generate_for_user(user)
        return Response(token_data)


class ClientTokenRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.save()
        try:
            send_password_reset_email(token.user, token)
        except EmailDeliveryError:
            logger.exception("Falha ao enviar e-mail de redefinição para %s", token.user.email)
            return Response(
                {"detail": "Não foi possível enviar o e-mail de redefinição. Tente novamente em instantes."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response({"detail": "Verifique seu e-mail para continuar."})


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Senha redefinida com sucesso."})


class CustomerProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.customer_profile
        except Customer.DoesNotExist:
            return Response({"detail": "Perfil não encontrado."}, status=status.HTTP_404_NOT_FOUND)
        data = CustomerSerializer(profile).data
        return Response(data)

    def patch(self, request):
        try:
            profile = request.user.customer_profile
        except Customer.DoesNotExist:
            return Response({"detail": "Perfil não encontrado."}, status=status.HTTP_404_NOT_FOUND)
        serializer = UpdateCustomerSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        if "full_name" in serializer.validated_data:
            profile.user.first_name = serializer.validated_data["full_name"]
            profile.user.save(update_fields=["first_name"])
        return Response(CustomerSerializer(profile).data)


class AdminLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        if not user.is_staff:
            return Response({"detail": "Acesso negado."}, status=status.HTTP_403_FORBIDDEN)
        token_data = TokenPairSerializer.generate_for_user(user)
        return Response(token_data)


class AdminTokenRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]


class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({"detail": "Acesso negado."}, status=status.HTTP_403_FORBIDDEN)

        now = timezone.now()
        recent_window = now - timedelta(days=7)

        customer_total = Customer.objects.count()
        customer_verified = Customer.objects.filter(email_verified=True).count()
        customer_pending = customer_total - customer_verified
        customer_recent = Customer.objects.filter(created_at__gte=recent_window).count()

        intents_by_status = {
            entry["status"]: entry["total"]
            for entry in PedidoIntencao.objects.values("status").annotate(total=Count("id"))
        }
        intents_recent = PedidoIntencao.objects.filter(criado_em__gte=recent_window).count()

        pending_reviews = Avaliacao.objects.filter(compra_verificada=False).count()
        awaiting_permissions = AllowedRating.objects.filter(used_at__isnull=True).count()
        expiring_permissions = AllowedRating.objects.filter(
            expires_at__isnull=False,
            expires_at__lte=now + timedelta(days=3),
            used_at__isnull=True,
        ).count()

        return Response(
            {
                "customers": {
                    "total": customer_total,
                    "verified": customer_verified,
                    "pending_verification": customer_pending,
                    "new_last_7_days": customer_recent,
                },
                "purchase_intents": {
                    "counts_by_status": intents_by_status,
                    "created_last_7_days": intents_recent,
                },
                "reviews": {
                    "pending_verification": pending_reviews,
                    "active_permissions": awaiting_permissions,
                    "permissions_expiring_3_days": expiring_permissions,
                },
                "generated_at": now,
            }
        )
