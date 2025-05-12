from django.db import models
from cloudinary.models import CloudinaryField

class Categoria(models.Model):
    nome = models.CharField(max_length=100)  # Ex: "Feminina", "Masculina"
    slug = models.SlugField(unique=True)     # Ex: "feminina"
    def __str__(self):
        return self.nome
    
class TipoItem(models.Model):
    nome = models.CharField(max_length=100)  # Ex: "Blusa", "calça"
    slug = models.SlugField(unique=True)     # Ex: "feminina"
    def __str__(self):
        return self.nome

class Produto(models.Model):
    nome = models.CharField(max_length=200)
    descricao = models.TextField()
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    imagem = CloudinaryField('image')  # Substitua ImageField por CloudinaryField
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='produtos')
    em_destaque = models.BooleanField(default=False)
    link_whatsapp = models.CharField(max_length=255)  # Link para WhatsApp
    tipo = models.ForeignKey(TipoItem,  on_delete=models.CASCADE, related_name='produtos')

    def __str__(self):
        return self.nome

class Banner(models.Model):
    imagem = CloudinaryField('image')  # Substitua ImageField por CloudinaryField
    ativo = models.BooleanField(default=True)

    def __str__(self):
        return f"Banner {self.id}"

class Contato(models.Model):
    endereco = models.TextField()
    instagram = models.CharField(max_length=100)
    sobre_loja = models.TextField()

    def __str__(self):
        return "Informações de Contato"