from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from produtos.views import (
    ProdutoViewSet, CategoriaViewSet, BannerList,
    ContatoDetail, HomeView, 
    ProdutosFemininaView,
    ProdutosMasculinaView,
    ProdutosInfantilView,
    ProdutosAcessoriosView,
    AvaliacaoAPIView,
    SuporteAPIView,
    PedidoIntencaoViewSet,
)
from produtos.admin_views import (
    ProdutoAdminViewSet,
    CategoriaAdminViewSet,
    BannerAdminViewSet,
    AvaliacaoAdminViewSet,
    AllowedRatingAdminViewSet,
    CustomerAdminViewSet,
    ConfiguracaoLojaViewSet,
)
from rest_framework.authtoken.views import obtain_auth_token
from django.conf import settings
from django.conf.urls.static import static
from accounts.urls import client_patterns, admin_patterns

API_DESCRIPTION = """
APIs segmentadas por namespace:

- **/api/** → Catálogo público e intenções do cliente.
- **/api/client/** → Autenticação do cliente (registro, login, verificação, senha, perfil).
- **/api/admin/** → Autenticação administrativa e CRUDs internos (produtos, banners, avaliações, AllowedRating, clientes e configurações).

Todas as rotas protegidas utilizam JWT Bearer (Authorization: Bearer <token>).
"""

schema_view = get_schema_view(
    openapi.Info(
        title="Loja Leonet API",
        default_version='v1',
        description=API_DESCRIPTION,
        contact=openapi.Contact(email="contato@lojalonet.com"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

client_router = DefaultRouter()
client_router.register(r'produtos', ProdutoViewSet, basename='produto')
client_router.register(r'categorias', CategoriaViewSet, basename='categoria')
client_router.register(r'pedidos-intencao', PedidoIntencaoViewSet, basename='pedido-intencao')

admin_router = DefaultRouter()
admin_router.register(r'produtos', ProdutoAdminViewSet, basename='admin-produtos')
admin_router.register(r'categorias', CategoriaAdminViewSet, basename='admin-categorias')
admin_router.register(r'banners', BannerAdminViewSet, basename='admin-banners')
admin_router.register(r'avaliacoes', AvaliacaoAdminViewSet, basename='admin-avaliacoes')
admin_router.register(r'clientes', CustomerAdminViewSet, basename='admin-clientes')
admin_router.register(r'allowed-ratings', AllowedRatingAdminViewSet, basename='admin-allowed-ratings')
admin_router.register(r'configuracoes', ConfiguracaoLojaViewSet, basename='admin-configuracoes')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(client_router.urls)),
    path('api/client/', include(client_patterns, namespace='client-auth')),
    path('api/admin/', include((admin_router.urls, 'admin-resources'), namespace='admin-resources')),
    path('api/admin/', include(admin_patterns, namespace='admin-auth')),
    path('api/banners/', BannerList.as_view()),
    path('api/contato/', ContatoDetail.as_view()),
    path('api/home/', HomeView.as_view()),
    path('api/login/', obtain_auth_token),
    path('api/produtos_feminina/', ProdutosFemininaView.as_view()),
    path('api/produtos_masculina/', ProdutosMasculinaView.as_view()),
    path('api/produtos_infantil/', ProdutosInfantilView.as_view()),
    path('api/produtos_acessorios/', ProdutosAcessoriosView.as_view()),
    #avaliação
    path('api/avaliacoes/', AvaliacaoAPIView.as_view(), name='avaliacoes-list'),
    path('api/produtos/<int:produto_id>/avaliacoes/', AvaliacaoAPIView.as_view(), name='avaliacoes-by-product'),
    path('api/avaliacoes/<int:pk>/', AvaliacaoAPIView.as_view(), name='avaliacoes-detail'),
    #Suporte
    path('api/suporte/', SuporteAPIView.as_view(), name='suporte-api'),
]

if settings.DEBUG:
    urlpatterns += [
        re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
        re_path(r'^swagger/?$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
        re_path(r'^redoc/?$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    ]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)