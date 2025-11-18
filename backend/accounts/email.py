from django.conf import settings
from django.core.mail import send_mail


def send_verification_email(user, token):
    verify_path = getattr(settings, "FRONTEND_VERIFY_EMAIL_PATH", "/auth/verify-email")
    base_url = getattr(settings, "FRONTEND_BASE_URL", "")
    verification_url = f"{base_url}{verify_path}?token={token.token}"
    subject = "Confirme seu e-mail"
    message = (
        "Olá,\n\n"
        "Obrigado por se cadastrar na Loja Leonet. Clique no link abaixo para confirmar seu e-mail:\n"
        f"{verification_url}\n\n"
        "Se você não solicitou este cadastro, ignore este e-mail."
    )
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])


def send_password_reset_email(user, token):
    reset_path = getattr(settings, "FRONTEND_RESET_PASSWORD_PATH", "/auth/reset-password")
    base_url = getattr(settings, "FRONTEND_BASE_URL", "")
    reset_url = f"{base_url}{reset_path}?token={token.token}"
    subject = "Redefinição de senha"
    message = (
        "Olá,\n\n"
        "Recebemos um pedido para redefinir sua senha. Clique no link abaixo para continuar:\n"
        f"{reset_url}\n\n"
        "Se você não solicitou a redefinição, ignore este e-mail."
    )
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
