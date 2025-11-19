from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.email import EmailDeliveryError
from accounts.models import Customer
from produtos.models import (
    AllowedRating,
    Categoria,
    PedidoIntencao,
    Produto,
    TipoItem,
)


User = get_user_model()


class AdminDashboardViewTests(APITestCase):
    def setUp(self):
        self.url = reverse('admin-auth:admin-dashboard-summary')
        self.staff = User.objects.create_user(
            username='staff',
            email='staff@example.com',
            password='staff-pass',
            is_staff=True,
        )
        self.client_user = User.objects.create_user(
            username='customer',
            email='customer@example.com',
            password='cust-pass',
        )
        self.customer_profile = Customer.objects.create(
            user=self.client_user,
            full_name='Cliente Teste',
            email_verified=True,
        )

        # Non-recent, non-verified customer
        older_user = User.objects.create_user(
            username='old_customer',
            email='old@example.com',
            password='old-pass',
        )
        self.old_profile = Customer.objects.create(
            user=older_user,
            full_name='Cliente Antigo',
            email_verified=False,
        )
        Customer.objects.filter(pk=self.old_profile.pk).update(
            created_at=timezone.now() - timedelta(days=10)
        )

        self.categoria = Categoria.objects.create(nome='Feminina', slug='feminina')
        self.tipo_item = TipoItem.objects.create(nome='Blusa', slug='blusa')
        self.produto = Produto.objects.create(
            nome='Produto Teste',
            descricao='Desc',
            preco='100.00',
            imagem='dummy',
            categoria=self.categoria,
            em_destaque=False,
            link_whatsapp='https://wa.me/5599999999999',
            tipo=self.tipo_item,
            estoque=5,
        )
        self.produto_extra = Produto.objects.create(
            nome='Produto Extra',
            descricao='Desc',
            preco='80.00',
            imagem='dummy',
            categoria=self.categoria,
            em_destaque=False,
            link_whatsapp='https://wa.me/5599999999999',
            tipo=self.tipo_item,
            estoque=3,
        )

    def test_requires_authentication(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_forbids_non_staff_users(self):
        self.client.force_authenticate(self.client_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_returns_summary_metrics_for_admin(self):
        PedidoIntencao.objects.create(
            usuario=self.client_user,
            produto=self.produto,
        )
        concluded = PedidoIntencao.objects.create(
            usuario=self.client_user,
            produto=self.produto,
        )
        concluded.marcar_status(PedidoIntencao.Status.CONCLUIDA, self.staff)
        PedidoIntencao.objects.filter(pk=concluded.pk).update(
            criado_em=timezone.now() - timedelta(days=2)
        )
        older = PedidoIntencao.objects.create(
            usuario=self.client_user,
            produto=self.produto,
        )
        PedidoIntencao.objects.filter(pk=older.pk).update(
            criado_em=timezone.now() - timedelta(days=9)
        )

        allowed = AllowedRating.objects.get(usuario=self.client_user, produto=self.produto)
        AllowedRating.objects.filter(pk=allowed.pk).update(
            expires_at=timezone.now() + timedelta(days=2),
            used_at=None,
        )

        AllowedRating.objects.create(
            usuario=self.client_user,
            produto=self.produto_extra,
            expires_at=timezone.now() + timedelta(days=5),
            used_at=timezone.now(),
        )

        self.client.force_authenticate(self.staff)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertIn('customers', data)
        self.assertEqual(data['customers']['total'], 2)
        self.assertEqual(data['customers']['verified'], 1)
        self.assertEqual(data['customers']['pending_verification'], 1)
        self.assertEqual(data['customers']['new_last_7_days'], 1)

        intents = data['purchase_intents']
        self.assertEqual(intents['counts_by_status']['aguardando'], 2)
        self.assertEqual(intents['counts_by_status']['concluida'], 1)
        self.assertEqual(intents['created_last_7_days'], 2)

        reviews = data['reviews']
        self.assertEqual(reviews['pending_verification'], 0)
        self.assertEqual(reviews['active_permissions'], 1)
        self.assertEqual(reviews['permissions_expiring_3_days'], 1)


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class AuthEmailFlowTests(APITestCase):

    def setUp(self):
        self.register_url = reverse('client-auth:client-auth-register')
        self.forgot_url = reverse('client-auth:client-auth-forgot')
        self.user = User.objects.create_user(
            username='existing',
            email='existing@example.com',
            password='secret123',
        )
        Customer.objects.create(user=self.user, full_name='Cliente Existente')

    def test_register_sends_verification_email(self):
        payload = {
            'full_name': 'Teste Usuário',
            'email': 'novo@example.com',
            'password': 'SenhaForte123',
        }
        response = self.client.post(self.register_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Confirme seu e-mail', mail.outbox[0].subject)

    def test_register_returns_accepted_when_email_fails(self):
        payload = {
            'full_name': 'Outro Usuário',
            'email': 'falha@example.com',
            'password': 'SenhaForte123',
        }
        with patch('accounts.views.send_verification_email', side_effect=EmailDeliveryError("erro")):
            response = self.client.post(self.register_url, payload)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertIn('não foi possível enviar', response.data['detail'])

    def test_forgot_password_returns_service_unavailable_on_email_failure(self):
        payload = {'email': 'existing@example.com'}
        with patch('accounts.views.send_password_reset_email', side_effect=EmailDeliveryError("erro")):
            response = self.client.post(self.forgot_url, payload)
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertIn('Não foi possível enviar', response.data['detail'])

    def test_forgot_password_sends_email(self):
        payload = {'email': 'existing@example.com'}
        response = self.client.post(self.forgot_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Redefinição de senha', mail.outbox[0].subject)

