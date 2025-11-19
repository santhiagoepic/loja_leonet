from datetime import timedelta
from unittest.mock import patch

from cloudinary.models import CloudinaryField
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
	AllowedRating,
	Categoria,
	PedidoIntencao,
	Produto,
	TipoAvaliacao,
	TipoItem,
)


User = get_user_model()


class AllowedRatingEvaluationTests(APITestCase):

	def setUp(self):
		self.cloudinary_patcher = patch.object(
			CloudinaryField,
			'pre_save',
			return_value='mocked-cloudinary-reference',
		)
		self.cloudinary_patcher.start()

		self.user = User.objects.create_user(
			username='customer',
			email='customer@example.com',
			password='test-pass',
		)
		self.admin = User.objects.create_user(
			username='admin',
			email='admin@example.com',
			password='admin-pass',
			is_staff=True,
		)
		self.categoria = Categoria.objects.create(nome='Feminina', slug='feminina')
		self.tipo_item = TipoItem.objects.create(nome='Blusa', slug='blusa')
		self.produto = Produto.objects.create(
			nome='Produto Teste',
			descricao='Descrição',
			preco='100.00',
			imagem='test-image',
			categoria=self.categoria,
			em_destaque=False,
			link_whatsapp='https://wa.me/5599999999999',
			tipo=self.tipo_item,
			estoque=10,
		)
		self.tipo_avaliacao = TipoAvaliacao.objects.create(nome='Qualidade')
		self.url = reverse('avaliacoes-list')

	def tearDown(self):
		super().tearDown()
		self.cloudinary_patcher.stop()

	def _make_photo(self):
		return SimpleUploadedFile('foto.jpg', b'fake-image-content', content_type='image/jpeg')

	def test_cannot_create_review_without_allowed_rating(self):
		self.client.force_authenticate(self.user)
		response = self.client.post(
			self.url,
			{
				'produto_id': self.produto.id,
				'tipo_avaliacao_id': self.tipo_avaliacao.id,
				'nota': 8,
				'comentario': 'Bom produto',
				'nome_completo': 'Cliente Teste',
				'foto_produto': self._make_photo(),
			},
			format='multipart',
		)
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('detail', response.data)
		self.assertEqual(AllowedRating.objects.count(), 0)

	def test_can_create_review_with_allowed_rating_from_concluded_purchase(self):
		pedido = PedidoIntencao.objects.create(usuario=self.user, produto=self.produto)
		pedido.marcar_status(PedidoIntencao.Status.CONCLUIDA, self.admin)

		self.client.force_authenticate(self.user)
		response = self.client.post(
			self.url,
			{
				'produto_id': self.produto.id,
				'tipo_avaliacao_id': self.tipo_avaliacao.id,
				'nota': 9,
				'comentario': 'Excelente',
				'nome_completo': 'Cliente Teste',
				'foto_produto': self._make_photo(),
			},
			format='multipart',
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		allowed = AllowedRating.objects.get(usuario=self.user, produto=self.produto)
		self.assertIsNotNone(allowed.used_at)

	def test_cannot_create_review_with_expired_allowed_rating(self):
		AllowedRating.objects.create(
			usuario=self.user,
			produto=self.produto,
			expires_at=timezone.now() - timedelta(days=1),
		)

		self.client.force_authenticate(self.user)
		response = self.client.post(
			self.url,
			{
				'produto_id': self.produto.id,
				'tipo_avaliacao_id': self.tipo_avaliacao.id,
				'nota': 7,
				'comentario': 'Fora do prazo',
				'nome_completo': 'Cliente Teste',
				'foto_produto': self._make_photo(),
			},
			format='multipart',
		)
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(AllowedRating.objects.count(), 0)


class AdminNamespaceCrudTests(APITestCase):

	def setUp(self):
		self.cloudinary_patcher = patch.object(
			CloudinaryField,
			'pre_save',
			return_value='mocked-cloudinary-reference',
		)
		self.cloudinary_patcher.start()

		self.user = User.objects.create_user(
			username='customer2',
			email='customer2@example.com',
			password='test-pass',
		)
		self.admin = User.objects.create_user(
			username='admin2',
			email='admin2@example.com',
			password='admin-pass',
			is_staff=True,
		)
		self.categoria = Categoria.objects.create(nome='Masculina', slug='masculina')
		self.tipo_item = TipoItem.objects.create(nome='Calça', slug='calca')
		self.produto = Produto.objects.create(
			nome='Produto Base',
			descricao='Descrição base',
			preco='200.00',
			imagem='image-ref',
			categoria=self.categoria,
			em_destaque=False,
			link_whatsapp='https://wa.me/5500000000000',
			tipo=self.tipo_item,
			estoque=5,
		)
		self.produtos_url = reverse('admin-resources:admin-produtos-list')

	def tearDown(self):
		super().tearDown()
		self.cloudinary_patcher.stop()

	def test_non_admin_cannot_create_product_via_admin_namespace(self):
		self.client.force_authenticate(self.user)
		payload = {
			'nome': 'Novo Produto',
			'descricao': 'Descrição',
			'preco': '150.00',
			'imagem': 'imagem',
			'em_destaque': False,
			'link_whatsapp': 'https://wa.me/559999999999',
			'estoque': 3,
			'categoria_id': self.categoria.id,
			'tipo_id': self.tipo_item.id,
		}
		response = self.client.post(self.produtos_url, payload, format='json')
		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_admin_can_create_product_via_namespace(self):
		self.client.force_authenticate(self.admin)
		payload = {
			'nome': 'Produto Admin',
			'descricao': 'Criado pelo admin',
			'preco': '300.00',
			'imagem': 'imagem',
			'em_destaque': True,
			'link_whatsapp': 'https://wa.me/551111111111',
			'estoque': 7,
			'categoria_id': self.categoria.id,
			'tipo_id': self.tipo_item.id,
		}
		response = self.client.post(self.produtos_url, payload, format='json')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertTrue(Produto.objects.filter(nome='Produto Admin').exists())

	def test_admin_updates_pedido_status_and_generates_allowed_rating(self):
		pedido = PedidoIntencao.objects.create(usuario=self.user, produto=self.produto)
		self.client.force_authenticate(self.admin)
		url = reverse('admin-resources:admin-pedidos-intencao-detail', args=[pedido.id])
		response = self.client.patch(
			url,
			{'status': PedidoIntencao.Status.CONCLUIDA},
			format='json',
		)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(
			AllowedRating.objects.filter(usuario=self.user, produto=self.produto).exists()
		)


class PedidoIntencaoClientTests(APITestCase):

	def setUp(self):
		self.cloudinary_patcher = patch.object(
			CloudinaryField,
			'pre_save',
			return_value='mocked-cloudinary-reference',
		)
		self.cloudinary_patcher.start()

		self.user = User.objects.create_user(
			username='cliente-pedido',
			email='clientepedido@example.com',
			password='test-pass',
		)
		self.other_user = User.objects.create_user(
			username='outro-cliente',
			email='outro@example.com',
			password='test-pass',
		)
		self.categoria = Categoria.objects.create(nome='Infantil', slug='infantil')
		self.tipo_item = TipoItem.objects.create(nome='Sapato', slug='sapato')
		self.produto = Produto.objects.create(
			nome='Produto Pedido',
			descricao='Produto para pedidos',
			preco='150.00',
			imagem='img-ref',
			categoria=self.categoria,
			em_destaque=False,
			link_whatsapp='https://wa.me/558888888888',
			tipo=self.tipo_item,
			estoque=2,
		)

	def tearDown(self):
		super().tearDown()
		self.cloudinary_patcher.stop()

	def test_customer_can_cancel_pending_intention(self):
		pedido = PedidoIntencao.objects.create(usuario=self.user, produto=self.produto)
		self.client.force_authenticate(self.user)
		url = reverse('pedido-intencao-detail', args=[pedido.id])
		response = self.client.delete(url)
		self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
		self.assertFalse(PedidoIntencao.objects.filter(id=pedido.id).exists())

	def test_customer_cannot_cancel_non_pending_intention(self):
		pedido = PedidoIntencao.objects.create(usuario=self.user, produto=self.produto)
		pedido.status = PedidoIntencao.Status.CONCLUIDA
		pedido.save(update_fields=['status'])
		self.client.force_authenticate(self.user)
		url = reverse('pedido-intencao-detail', args=[pedido.id])
		response = self.client.delete(url)
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertTrue(PedidoIntencao.objects.filter(id=pedido.id).exists())

	def test_customer_cannot_cancel_other_user_intention(self):
		pedido = PedidoIntencao.objects.create(usuario=self.other_user, produto=self.produto)
		self.client.force_authenticate(self.user)
		url = reverse('pedido-intencao-detail', args=[pedido.id])
		response = self.client.delete(url)
		self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
		self.assertTrue(PedidoIntencao.objects.filter(id=pedido.id).exists())

	def test_customer_can_attach_shipping_info_on_creation(self):
		self.client.force_authenticate(self.user)
		payload = {
			'produto_id': self.produto.id,
			'nome_contato': 'Maria Cliente',
			'telefone_contato': '11999999999',
			'endereco_entrega': 'Rua Um, 123',
			'observacoes_cliente': 'Preferência por entrega à tarde.',
		}
		response = self.client.post(
			reverse('pedido-intencao-list'),
			payload,
			format='json',
		)
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		pedido = PedidoIntencao.objects.get(id=response.data['id'])
		self.assertEqual(pedido.nome_contato, payload['nome_contato'])
		self.assertEqual(pedido.telefone_contato, payload['telefone_contato'])
		self.assertEqual(pedido.endereco_entrega, payload['endereco_entrega'])
		self.assertEqual(pedido.observacoes_cliente, payload['observacoes_cliente'])
