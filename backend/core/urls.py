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
)
from rest_framework.authtoken.views import obtain_auth_token
from django.conf import settings
from django.conf.urls.static import static

schema_view = get_schema_view(
    openapi.Info(
        title="Loja Leonet API",
        default_version='v1',
        description="Documentação dos endpoints públicos da Loja Leonet.",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

router = DefaultRouter()
router.register(r'produtos', ProdutoViewSet, basename='produto')
router.register(r'categorias', CategoriaViewSet, basename='categoria')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
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