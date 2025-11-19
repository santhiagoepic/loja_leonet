from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from accounts.models import Customer
from accounts.serializers import CustomerAdminSerializer
from django.utils import timezone

from .models import AllowedRating, Avaliacao, Banner, Categoria, Contato, Produto, TipoAvaliacao, TipoItem, PedidoIntencao
from .serializers import (
    AllowedRatingSerializer,
    AvaliacaoSerializer,
    BannerSerializer,
    CategoriaSerializer,
    ContatoSerializer,
    PedidoIntencaoAdminSerializer,
    ProdutoAdminSerializer,
    TipoAvaliacaoSerializer,
    TipoItemSerializer,
)


class BaseAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]


class ProdutoAdminViewSet(BaseAdminViewSet):
    queryset = Produto.objects.all().select_related("categoria", "tipo")
    serializer_class = ProdutoAdminSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @action(detail=True, methods=["post"], url_path="atualizar-estoque")
    def atualizar_estoque(self, request, pk=None):
        produto = self.get_object()
        try:
            estoque = int(request.data.get("estoque"))
        except (TypeError, ValueError):
            return Response(
                {"detail": "Valor de estoque inválido."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        produto.estoque = estoque
        produto.save(update_fields=["estoque"])
        return Response(self.get_serializer(produto).data)


class CategoriaAdminViewSet(BaseAdminViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer


class BannerAdminViewSet(BaseAdminViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)


class AvaliacaoAdminViewSet(BaseAdminViewSet):
    queryset = Avaliacao.objects.select_related("produto", "usuario")
    serializer_class = AvaliacaoSerializer


class AllowedRatingAdminViewSet(BaseAdminViewSet):
    queryset = AllowedRating.objects.select_related("usuario", "produto")
    serializer_class = AllowedRatingSerializer


class TipoItemAdminViewSet(BaseAdminViewSet):
    queryset = TipoItem.objects.all()
    serializer_class = TipoItemSerializer


class TipoAvaliacaoAdminViewSet(BaseAdminViewSet):
    queryset = TipoAvaliacao.objects.all()
    serializer_class = TipoAvaliacaoSerializer


class PedidoIntencaoAdminViewSet(BaseAdminViewSet):
    queryset = PedidoIntencao.objects.select_related("usuario", "produto")
    serializer_class = PedidoIntencaoAdminSerializer

    def perform_update(self, serializer):
        instance = serializer.save(
            confirmado_por=self.request.user,
            confirmado_em=timezone.now(),
        )
        instance.sync_allowed_rating()


class CustomerAdminViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [permissions.IsAdminUser]
    queryset = Customer.objects.select_related("user")
    serializer_class = CustomerAdminSerializer


class ConfiguracaoLojaViewSet(BaseAdminViewSet):
    queryset = Contato.objects.all()
    serializer_class = ContatoSerializer