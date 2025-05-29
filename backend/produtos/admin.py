from django.contrib import admin
from .models import Categoria, Produto, Banner, Contato, TipoItem, Avaliacao, TipoAvaliacao

admin.site.register(Categoria)
admin.site.register(Produto)
admin.site.register(Banner)
admin.site.register(Contato)
admin.site.register(TipoItem)
admin.site.register(Avaliacao)
admin.site.register(TipoAvaliacao)
# Register your models here.
