from django.contrib import admin
from .models import Categoria, Produto, Banner, Contato, TipoItem, Avaliacao, TipoAvaliacao, Suporte

admin.site.register(Categoria)
admin.site.register(Produto)
admin.site.register(Banner)
admin.site.register(Contato)
admin.site.register(TipoItem)
admin.site.register(Avaliacao)
admin.site.register(TipoAvaliacao)
admin.site.register(Suporte)


# Register your models here.
