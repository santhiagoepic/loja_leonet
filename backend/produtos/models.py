from django.db import models
from cloudinary.models import CloudinaryField
from django.core.exceptions import ValidationError

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
    data = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-data']  # Ordena por data decrescente por padrão

    def __str__(self):
        return f"Avaliação {self.nota}/10 - {self.tipo_avaliacao.nome} para {self.produto.nome}"

    def clean(self):
        if not (0 <= self.nota <= 10):
            raise ValidationError({'nota': 'A nota deve estar entre 0 e 10.'})
        
#Cria um banco de dados do suporte
class Suporte(models.Model):
    mensagem = models.TextField()
    produto = models.ForeignKey('Produto', on_delete=models.CASCADE, related_name='suportes')
    tipo_suporte = models.CharField(max_length=100)
    contato = models.CharField(max_length=100)
    telefone = models.CharField(max_length=100)
    email = models.EmailField(max_length=20)

    def __str__(self):
        return f"{self.contato} - {self.tipo_suporte}"