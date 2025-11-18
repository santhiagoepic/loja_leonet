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
