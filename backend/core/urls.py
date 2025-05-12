from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from produtos.views import (
    ProdutoViewSet, CategoriaViewSet, BannerList,
    ContatoDetail, HomeView, 
    ProdutosFemininaView,
    ProdutosMasculinaView,
    ProdutosInfantilView,
    ProdutosAcessoriosView,
)
from rest_framework.authtoken.views import obtain_auth_token
from django.conf import settings
from django.conf.urls.static import static

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
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)