from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Categoria,
    Produto,
    Banner,
    Contato,
    TipoItem,
    Avaliacao,
    TipoAvaliacao,
    Suporte,
    PedidoIntencao,
    AllowedRating,
    UserProfile,
)


User = get_user_model()


class CloudinaryImageField(serializers.ImageField):
    def to_internal_value(self, data):
        if isinstance(data, str):
            return data
        return super().to_internal_value(data)


class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email')
        read_only_fields = fields


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ('user', 'phone_number')
        read_only_fields = ('user',)

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'slug']
class TipoItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoItem
        fields = ['id', 'nome', 'slug']
class ProdutoSerializer(serializers.ModelSerializer):
    imagem = serializers.ImageField(read_only=True)

    class Meta:
        model = Produto
        fields = ['id', 'nome', 'descricao', 'preco', 'imagem', 'categoria', 'estoque', 'em_destaque', 'link_whatsapp']


class ProdutoAdminSerializer(serializers.ModelSerializer):
    imagem = CloudinaryImageField(required=False, allow_null=True)
    categoria = CategoriaSerializer(read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(), source='categoria', write_only=True
    )
    tipo = TipoItemSerializer(read_only=True)
    tipo_id = serializers.PrimaryKeyRelatedField(
        queryset=TipoItem.objects.all(), source='tipo', write_only=True
    )

    class Meta:
        model = Produto
        fields = [
            'id', 'nome', 'descricao', 'preco', 'imagem', 'em_destaque', 'link_whatsapp',
            'estoque', 'categoria', 'categoria_id', 'tipo', 'tipo_id'
        ]

class BannerSerializer(serializers.ModelSerializer):
    imagem = CloudinaryImageField(required=False, allow_null=True)

    class Meta:
        model = Banner
        fields = ['id', 'imagem', 'ativo']

class ContatoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contato
        fields = ['id', 'endereco', 'instagram', 'sobre_loja']

class TipoAvaliacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoAvaliacao
        fields = ['id', 'nome']

class AvaliacaoSerializer(serializers.ModelSerializer):
    tipo_avaliacao = TipoAvaliacaoSerializer(read_only=True)
    tipo_avaliacao_id = serializers.PrimaryKeyRelatedField(
        queryset=TipoAvaliacao.objects.all(), 
        source='tipo_avaliacao',
        write_only=True
    )
    usuario = UserPublicSerializer(read_only=True)
    verificado_por = UserPublicSerializer(read_only=True)
    compra_verificada = serializers.BooleanField(read_only=True)
    verificado_em = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Avaliacao
        fields = (
            'id', 'produto', 'tipo_avaliacao', 'tipo_avaliacao_id', 'comentario', 'nome_completo',
            'nota', 'foto_produto', 'usuario', 'compra_verificada', 'verificado_por', 'verificado_em',
            'data'
        )
        read_only_fields = ('produto', 'usuario', 'compra_verificada', 'verificado_por', 'verificado_em', 'data')

    def validate_nota(self, value):
        if not 1 <= value <= 10:
            raise serializers.ValidationError("A nota deve estar entre 1 e 10.")
        return value

class AvaliacaoListSerializer(serializers.ModelSerializer):
    tipo_avaliacao = TipoAvaliacaoSerializer()
    usuario = UserPublicSerializer()
    compra_verificada = serializers.BooleanField()
    
    class Meta:
        model = Avaliacao
        fields = [
            'id', 'tipo_avaliacao', 'comentario', 'nota', 'foto_produto',
            'data', 'nome_completo', 'usuario', 'compra_verificada'
        ]

class SuporteSerializer(serializers.ModelSerializer):
    usuario = UserPublicSerializer(read_only=True)
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    produto_id = serializers.PrimaryKeyRelatedField(
        queryset=Produto.objects.all(),
        source='produto',
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Suporte
        fields = [
            'id',
            'mensagem',
            'tipo_suporte',
            'contato',
            'telefone',
            'email',
            'produto_nome',
            'produto_id',
            'usuario',
            'created_at',
        ]
        read_only_fields = ('id', 'produto_nome', 'usuario', 'created_at')


class PedidoIntencaoSerializer(serializers.ModelSerializer):
    usuario = UserPublicSerializer(read_only=True)
    produto = ProdutoSerializer(read_only=True)
    produto_id = serializers.PrimaryKeyRelatedField(
        queryset=Produto.objects.all(), source='produto', write_only=True
    )
    confirmado_por = UserPublicSerializer(read_only=True)

    class Meta:
        model = PedidoIntencao
        fields = (
            'id', 'usuario', 'produto', 'produto_id', 'status', 'criado_em',
            'atualizado_em', 'observacoes_admin', 'confirmado_por', 'confirmado_em',
            'nome_contato', 'telefone_contato', 'endereco_entrega', 'observacoes_cliente'
        )
        read_only_fields = (
            'usuario', 'status', 'criado_em', 'atualizado_em', 'observacoes_admin', 'confirmado_por', 'confirmado_em',
        )


class PedidoIntencaoAdminSerializer(PedidoIntencaoSerializer):
    class Meta(PedidoIntencaoSerializer.Meta):
        read_only_fields = (
            'usuario', 'criado_em', 'atualizado_em', 'confirmado_por', 'confirmado_em'
        )


class AllowedRatingSerializer(serializers.ModelSerializer):
    usuario = UserPublicSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='usuario', write_only=True
    )
    produto_id = serializers.PrimaryKeyRelatedField(
        queryset=Produto.objects.all(), source='produto', write_only=True
    )
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)

    class Meta:
        model = AllowedRating
        fields = [
            'id', 'usuario', 'usuario_id', 'produto_nome', 'produto_id',
            'created_at', 'expires_at', 'used_at'
        ]
        read_only_fields = ('id', 'created_at')