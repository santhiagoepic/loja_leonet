from django.contrib import admin
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
	UserProfile,
	AllowedRating,
)


@admin.register(Avaliacao)
class AvaliacaoAdmin(admin.ModelAdmin):
	list_display = (
		'produto',
		'usuario',
		'nota',
		'compra_verificada',
		'verificado_por',
		'verificado_em',
		'data',
	)
	list_filter = ('compra_verificada', 'data', 'nota', 'tipo_avaliacao')
	search_fields = ('produto__nome', 'usuario__email', 'usuario__username', 'nome_completo')
	readonly_fields = ('data', 'verificado_em')


@admin.register(PedidoIntencao)
class PedidoIntencaoAdmin(admin.ModelAdmin):
	list_display = (
		'produto',
		'usuario',
		'status',
		'confirmado_por',
		'confirmado_em',
		'criado_em',
	)
	list_filter = ('status', 'criado_em', 'confirmado_em')
	search_fields = ('produto__nome', 'usuario__email', 'usuario__username')
	readonly_fields = ('criado_em', 'atualizado_em', 'confirmado_em')


@admin.register(AllowedRating)
class AllowedRatingAdmin(admin.ModelAdmin):
	list_display = ('produto', 'usuario', 'created_at', 'expires_at', 'used_at')
	list_filter = ('expires_at', 'used_at')
	search_fields = ('produto__nome', 'usuario__email', 'usuario__username')
	readonly_fields = ('created_at',)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
	list_display = ('user', 'phone_number')
	search_fields = ('user__email', 'user__username', 'phone_number')


admin.site.register(Categoria)
admin.site.register(Produto)
admin.site.register(Banner)
admin.site.register(Contato)
admin.site.register(TipoItem)
admin.site.register(TipoAvaliacao)
admin.site.register(Suporte)
