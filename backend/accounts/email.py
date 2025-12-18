import logging
from pathlib import Path
from typing import Optional, Sequence

from django.conf import settings
from django.core.mail import EmailMessage as DjangoEmailMessage, get_connection


logger = logging.getLogger(__name__)


class EmailDeliveryError(RuntimeError):
    """Erro lançado quando não é possível entregar um e-mail."""


def _send_basic_email(subject: str, body: str, recipient: str, attachments: Optional[Sequence[str]] = None) -> None:
    connection = get_connection()
    email = DjangoEmailMessage(
        subject=subject,
        body=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient],
        connection=connection,
    )

    for attachment in attachments or []:
        path = Path(attachment)
        if not path.exists():
            raise FileNotFoundError(f"Attachment not found: {path}")
        email.attach_file(path)

    try:
        email.send(fail_silently=False)
        logger.info("E-mail enviado para %s", recipient)
    except Exception as exc:  # pragma: no cover - logger keeps context
        logger.exception("Falha ao enviar e-mail para %s", recipient)
        raise EmailDeliveryError("Não foi possível enviar o e-mail.") from exc


def send_verification_email(user, token, attachments: Optional[Sequence[str]] = None):
    verify_path = getattr(settings, "FRONTEND_VERIFY_EMAIL_PATH", "/auth/verify-email")
    base_url = getattr(settings, "FRONTEND_BASE_URL", "")
    verification_url = f"{base_url}{verify_path}?token={token.token}"
    subject = "Confirme seu e-mail"
    message = (
        "Olá,\n\n"
        "Obrigado por se cadastrar na Loja Leoneth. Clique no link abaixo para confirmar seu e-mail:\n"
        f"{verification_url}\n\n"
        "Se você não solicitou este cadastro, ignore este e-mail."
    )
    _send_basic_email(subject, message, user.email, attachments)


def send_password_reset_email(user, token, attachments: Optional[Sequence[str]] = None):
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
    _send_basic_email(subject, message, user.email, attachments)
