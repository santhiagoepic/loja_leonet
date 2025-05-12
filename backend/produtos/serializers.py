from rest_framework import serializers
from .models import Categoria, Produto, Banner, Contato, TipoItem

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
        fields = ['id', 'nome', 'descricao', 'preco', 'imagem', 'categoria', 'em_destaque', 'link_whatsapp']

class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ['id', 'imagem', 'ativo']

class ContatoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contato
        fields = ['id', 'endereco', 'instagram', 'sobre_loja']