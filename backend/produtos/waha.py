import logging
import mimetypes
import os
from urllib.parse import urljoin

import requests
from requests import RequestException

logger = logging.getLogger(__name__)


class WhatsAppGatewayError(RuntimeError):
    """Erro lançado quando a integração com o WAHA falha."""


class WhatsAppGateway:
    """Cliente mínimo para enviar mensagens via WAHA (WhatsApp HTTP API)."""

    def __init__(self):
        self.base_url = os.getenv('WAHA_BASE_URL')
        self.instance_id = os.getenv('WAHA_INSTANCE_ID', 'default')
        self.api_token = os.getenv('WAHA_API_TOKEN')
        if not self.base_url:
            raise WhatsAppGatewayError('WAHA_BASE_URL não configurado.')

    def _build_url(self, path: str) -> str:
        base = self.base_url.rstrip('/') + '/'
        relative = path.lstrip('/')
        return urljoin(base, relative)

    def _headers(self) -> dict:
        headers = {'Content-Type': 'application/json'}
        if self.api_token:
            headers['x-api-key'] = self.api_token
        return headers

    @staticmethod
    def _format_chat_id(phone: str) -> str:
        digits = ''.join(filter(str.isdigit, phone or ''))
        if not digits:
            raise WhatsAppGatewayError('Telefone inválido para envio.')
        digits = digits.lstrip('0')
        return f'{digits}@c.us'

    def send_product_message(self, chat_phone: str, text: str, image_url: str | None = None, filename: str | None = None):
        chat_id = self._format_chat_id(chat_phone)
        session = self.instance_id or 'default'
        base_payload = {
            'chatId': chat_id,
            'session': session,
        }

        if image_url:
            try:
                return self._send_file_message(base_payload, text, image_url, filename)
            except WhatsAppGatewayError as exc:
                if self._is_plus_only_error(exc):
                    logger.warning('WAHA não suporta envio de arquivos no plano atual. Texto será enviado. Motivo: %s', exc)
                else:
                    logger.exception('Falha ao enviar mídia via WAHA: %s', exc)
                    raise

        try:
            return self._send_text_message(base_payload, text)
        except WhatsAppGatewayError as exc:
            logger.exception('Falha ao enviar mensagem via WAHA: %s', exc)
            raise

    def _send_file_message(self, base_payload: dict, caption: str, image_url: str, filename: str | None):
        endpoint = 'api/sendFile'
        mime_type, _ = mimetypes.guess_type(image_url)
        payload = {
            **base_payload,
            'caption': caption,
            'file': {
                'url': image_url,
                'mimetype': mime_type or 'image/jpeg',
                'filename': filename or (image_url.rsplit('/', 1)[-1] or 'produto.jpg'),
            },
        }
        return self._post(endpoint, payload)

    def _send_text_message(self, base_payload: dict, text: str):
        payload = {
            **base_payload,
            'text': text,
        }
        return self._post('api/sendText', payload)

    def _post(self, endpoint: str, payload: dict):
        try:
            response = requests.post(
                self._build_url(endpoint),
                json=payload,
                headers=self._headers(),
                timeout=15,
            )
        except RequestException as exc:
            logger.exception('Falha ao enviar mensagem via WAHA: %s', exc)
            raise WhatsAppGatewayError('Não foi possível contatar o servidor WhatsApp.') from exc

        if response.ok:
            return response.json() if response.content else {}

        detail = self._extract_error_detail(response)
        raise WhatsAppGatewayError(detail)

    @staticmethod
    def _extract_error_detail(response):
        try:
            data = response.json()
        except ValueError:
            data = response.text or ''

        if isinstance(data, dict):
            for key in ('message', 'detail', 'error', 'statusText'):
                value = data.get(key)
                if value:
                    return str(value)
            return str(data)
        if isinstance(data, list) and data:
            return str(data[0])
        return data or 'WAHA retornou um erro inesperado.'

    @staticmethod
    def _is_plus_only_error(exc: WhatsAppGatewayError) -> bool:
        message = str(exc).lower()
        return 'available only in plus version' in message or 'plus version' in message

