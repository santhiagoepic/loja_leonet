from datetime import timedelta

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from cloudinary.models import CloudinaryField
from django.core.exceptions import ValidationError


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"Perfil de {self.user.get_full_name() or self.user.email or self.user.username}"

#Cria um banco de dados das Categorias dos produtos
class Categoria(models.Model): #campo do tipo de item
    nome = models.CharField(max_length=100)  # Ex: "Feminina", "Masculina"
    slug = models.SlugField(unique=True)     # Ex: "feminina"
    def __str__(self):
        return self.nome
    
#Cria um banco de dados do Tipo de item dos produtos
class TipoItem(models.Model): #campo do tipo de item
    nome = models.CharField(max_length=100)  # Ex: "Blusa", "calça"
    slug = models.SlugField(unique=True)     # Ex: "feminina"
    def __str__(self):
        return self.nome

#Cria um banco de dados dos Produtos
class Produto(models.Model): #campo de produto
    nome = models.CharField(max_length=200)
    descricao = models.TextField()
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    imagem = CloudinaryField('image')  # Substitua ImageField por CloudinaryField
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='produtos')
    em_destaque = models.BooleanField(default=False)
    link_whatsapp = models.CharField(max_length=255)  # Link para WhatsApp
    tipo = models.ForeignKey(TipoItem,  on_delete=models.CASCADE, related_name='produtos')

    estoque = models.IntegerField(default=0)#estoque

    def __str__(self):
        return self.nome
    
#Cria um banco de dados dos Banners
class Banner(models.Model): #campo de banner
    imagem = CloudinaryField('image')  
    ativo = models.BooleanField(default=True)

    def __str__(self):
        return f"Banner {self.id}"
    
#Cria um banco de dados de Contatos
class Contato(models.Model): #campo de contato
    endereco = models.TextField()
    instagram = models.CharField(max_length=100)
    sobre_loja = models.TextField()

    def __str__(self):
        return "Informações de Contato"

#Cria um banco de dados Tipo de Avaliação
class TipoAvaliacao(models.Model):
    nome = models.CharField(max_length=100)
        
    def __str__(self):
        return self.nome

#Cria um banco de dados Avaliação
class Avaliacao(models.Model):
    produto = models.ForeignKey('Produto', on_delete=models.CASCADE, related_name='avaliacoes')
    tipo_avaliacao = models.ForeignKey(TipoAvaliacao, on_delete=models.CASCADE, related_name='avaliacoes')
    comentario = models.TextField()
    nome_completo = models.CharField(max_length=255)
    nota = models.IntegerField()
    foto_produto = CloudinaryField('image')
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='avaliacoes', null=True, blank=True)
    compra_verificada = models.BooleanField(default=False)
    verificado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='avaliacoes_verificadas',
        null=True,
        blank=True
    )
    verificado_em = models.DateTimeField(null=True, blank=True)
    data = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-data']  # Ordena por data decrescente por padrão
        constraints = [
            models.UniqueConstraint(fields=['produto', 'usuario'], name='unique_avaliacao_produto_usuario', condition=models.Q(usuario__isnull=False)),
        ]

    def __str__(self):
        return f"Avaliação {self.nota}/10 - {self.tipo_avaliacao.nome} para {self.produto.nome}"

    def clean(self):
        if not (1 <= self.nota <= 5):
            raise ValidationError({'nota': 'A nota deve estar entre 1 e 5.'})
        
#Cria um registro de intenções de compra
class PedidoIntencao(models.Model):
    class Status(models.TextChoices):
        AGUARDANDO = 'aguardando', 'Aguardando no WhatsApp'
        CONCLUIDA = 'concluida', 'Compra concluída'
        CANCELADA = 'cancelada', 'Pedido cancelado'

    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='intencoes_compra')
    produto = models.ForeignKey('Produto', on_delete=models.CASCADE, related_name='intencoes_compra')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AGUARDANDO)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)
    observacoes_admin = models.TextField(blank=True)
    confirmado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='intencoes_confirmadas'
    )
    confirmado_em = models.DateTimeField(null=True, blank=True)
    nome_contato = models.CharField(max_length=255, blank=True)
    telefone_contato = models.CharField(max_length=50, blank=True)
    endereco_entrega = models.CharField(max_length=255, blank=True)
    observacoes_cliente = models.TextField(blank=True)

    class Meta:
        ordering = ['-criado_em']
        verbose_name = 'Intenção de compra'
        verbose_name_plural = 'Intenções de compra'

    def marcar_status(self, status, admin_user):
        if status not in self.Status.values:
            raise ValidationError({'status': 'Status inválido.'})
        self.status = status
        self.confirmado_por = admin_user
        self.confirmado_em = timezone.now()
        self.save(update_fields=['status', 'confirmado_por', 'confirmado_em', 'atualizado_em'])
        self.sync_allowed_rating()

    def sync_allowed_rating(self):
        if self.status == self.Status.CONCLUIDA:
            AllowedRating.objects.update_or_create(
                usuario=self.usuario,
                produto=self.produto,
                defaults={
                    'expires_at': timezone.now() + timedelta(days=30),
                    'used_at': None,
                },
            )
        else:
            AllowedRating.objects.filter(
                usuario=self.usuario,
                produto=self.produto,
                used_at__isnull=True,
            ).delete()

    def __str__(self):
        return f"Intenção de {self.usuario} para {self.produto} - {self.get_status_display()}"


class WhatsAppOrder(models.Model):
    class Status(models.TextChoices):
        CREATED = 'created', _('Registrado')
        SENT = 'sent', _('Mensagem enviada')
        FAILED = 'failed', _('Falha no envio')

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='whatsapp_orders',
    )
    produto = models.ForeignKey(
        'Produto',
        on_delete=models.CASCADE,
        related_name='whatsapp_orders',
    )
    customer_phone = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CREATED)
    product_name_snapshot = models.CharField(max_length=255)
    product_price_snapshot = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    product_url = models.URLField(blank=True)
    image_url = models.URLField(blank=True)
    message_preview = models.TextField(blank=True)
    gateway_payload = models.JSONField(default=dict, blank=True)
    error_detail = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Envio automatizado (WhatsApp)'
        verbose_name_plural = 'Envios automatizados (WhatsApp)'

    def mark_sent(self, payload=None, message_preview=None):
        self.status = self.Status.SENT
        self.sent_at = timezone.now()
        if payload is not None:
            self.gateway_payload = payload
        if message_preview is not None:
            self.message_preview = message_preview
        self.save(update_fields=['status', 'sent_at', 'gateway_payload', 'message_preview'])

    def mark_failed(self, error_detail: str):
        self.status = self.Status.FAILED
        self.error_detail = error_detail
        self.save(update_fields=['status', 'error_detail'])


class AllowedRating(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='permissoes_avaliacao')
    produto = models.ForeignKey('Produto', on_delete=models.CASCADE, related_name='permissoes_avaliacao')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('usuario', 'produto')
        verbose_name = 'Permissão de avaliação'
        verbose_name_plural = 'Permissões de avaliação'

    @property
    def is_expired(self):
        return self.expires_at is not None and timezone.now() >= self.expires_at

    def mark_used(self):
        self.used_at = timezone.now()
        self.save(update_fields=['used_at'])

    def reset_usage(self):
        self.used_at = None
        self.save(update_fields=['used_at'])

    def __str__(self):
        status = 'expirada' if self.is_expired else 'ativa'
        if self.used_at:
            status = 'utilizada'
        return f"Permissão {status} para {self.usuario} em {self.produto}"

#Cria um banco de dados do suporte
class Suporte(models.Model):
    mensagem = models.TextField()
    produto = models.ForeignKey(
        'Produto',
        on_delete=models.SET_NULL,
        related_name='suportes',
        null=True,
        blank=True,
    )
    tipo_suporte = models.CharField(max_length=100)
    contato = models.CharField(max_length=100)
    telefone = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chamados_suporte',
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.contato} - {self.tipo_suporte}"