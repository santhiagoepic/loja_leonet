from rest_framework import serializers
from .models import Categoria, Produto, Banner, Contato, TipoItem, Avaliacao, TipoAvaliacao, Suporte

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'slug']
class TipoItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoItem
        fields = ['id', 'nome', 'slug']
class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = ['id', 'nome', 'descricao', 'preco', 'imagem', 'categoria',"estoque" ,'em_destaque', 'link_whatsapp']

class BannerSerializer(serializers.ModelSerializer):
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
    
    class Meta:
        model = Avaliacao
        fields = '__all__'
        extra_kwargs = {
            'data': {'read_only': True}
        }

    # def validate_nota(self, value):
    #     if not 0 <= value <= 10:
    #         raise serializers.ValidationError("A nota deve estar entre 0 e 10.")
    #     return value

class AvaliacaoListSerializer(serializers.ModelSerializer):
    tipo_avaliacao = TipoAvaliacaoSerializer()
    
    class Meta:
        model = Avaliacao
        fields = ['id', 'tipo_avaliacao', 'comentario', 'nota', 'foto_produto', 'data', 'nome_completo']

class SuporteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suporte
        fields = '__all__'