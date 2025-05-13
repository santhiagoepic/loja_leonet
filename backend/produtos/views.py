from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Categoria, Produto, Banner, Contato
from .serializers import CategoriaSerializer, ProdutoSerializer, BannerSerializer, ContatoSerializer
from rest_framework.views import APIView
from collections import defaultdict


# ViewSet para Produto (com CRUD completo + ação de destaque)
class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer

    def get_permissions(self):
        # Somente leitura para usuários não autenticados; CRUD completo para autenticados
        if self.action in ['list', 'retrieve', 'destaques']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'], url_path='destaque')
    def destaques(self, request):
        destaques = Produto.objects.filter(em_destaque=True)
        serializer = self.get_serializer(destaques, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# ViewSet para Categoria
class CategoriaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

    @action(detail=True, methods=['get'], url_path='produtos')
    def produtos_por_categoria(self, request, pk=None):
        categoria = self.get_object()
        produtos = categoria.produtos.all()
        serializer = ProdutoSerializer(produtos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
# View para banners ativos
class BannerList(generics.ListAPIView):
    queryset = Banner.objects.filter(ativo=True)
    serializer_class = BannerSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)  # Status explícito
    
# View para informações de contato (assumindo apenas 1 registro)
class ContatoDetail(generics.RetrieveAPIView):
    queryset = Contato.objects.all()
    serializer_class = ContatoSerializer

    def get_object(self):
        return Contato.objects.first()

# View para a Home (retorna destaques, banners e categorias principais)
class HomeView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        destaques = Produto.objects.filter(em_destaque=True)
        banners = Banner.objects.filter(ativo=True)
        categorias = Categoria.objects.all()

        return Response({
            'destaques': ProdutoSerializer(destaques, many=True).data,
            'banners': BannerSerializer(banners, many=True).data,
            'categorias': CategoriaSerializer(categorias, many=True).data, 
        }, status=status.HTTP_200_OK)

#FUNÇÃO PARA PÁGINA FEMININA(RETORNA APENAS A CATEGORIA FEMININA SEPARADA POR ITENS)
class ProdutosFemininaView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categoria = Categoria.objects.filter(slug='feminina').first()
        if not categoria:
            return Response({"detail": "Categoria Feminina não encontrada."}, status=status.HTTP_404_NOT_FOUND)
        
        produtos = Produto.objects.filter(categoria=categoria).select_related('tipo')
        produtos_por_tipo = defaultdict(list)

        for produto in produtos:
            produtos_por_tipo[produto.tipo.nome].append(produto)

        response_data = []
        for tipo_nome, produtos in produtos_por_tipo.items():
            serializer = ProdutoSerializer(produtos, many=True)
            response_data.append({
                'tipo': tipo_nome,
                'produtos': serializer.data
            })

        return Response(response_data, status=status.HTTP_200_OK)

#FUNÇÃO PARA PÁGINA MASCULINA(RETORNA APENAS A CATEGORIA FEMININA SEPARADA POR ITENS)
class ProdutosMasculinaView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categoria = Categoria.objects.filter(slug='masculina').first()
        if not categoria:
            return Response({"detail": "Categoria Masculina não encontrada."}, status=status.HTTP_404_NOT_FOUND)
        
        produtos = Produto.objects.filter(categoria=categoria).select_related('tipo')
        produtos_por_tipo = defaultdict(list)

        for produto in produtos:
            produtos_por_tipo[produto.tipo.nome].append(produto)

        response_data = []
        for tipo_nome, produtos in produtos_por_tipo.items():
            serializer = ProdutoSerializer(produtos, many=True)
            response_data.append({
                'tipo': tipo_nome,
                'produtos': serializer.data
            })

        return Response(response_data, status=status.HTTP_200_OK)

#FUNÇÃO PARA PÁGINA INFANTIL(RETORNA APENAS A CATEGORIA FEMININA SEPARADA POR ITENS)
class ProdutosInfantilView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categoria = Categoria.objects.filter(slug='infantil').first()
        if not categoria:
            return Response({"detail": "Categoria Infantil não encontrada."}, status=status.HTTP_404_NOT_FOUND)
        
        produtos = Produto.objects.filter(categoria=categoria).select_related('tipo')
        produtos_por_tipo = defaultdict(list)

        for produto in produtos:
            produtos_por_tipo[produto.tipo.nome].append(produto)

        response_data = []
        for tipo_nome, produtos in produtos_por_tipo.items():
            serializer = ProdutoSerializer(produtos, many=True)
            response_data.append({
                'tipo': tipo_nome,
                'produtos': serializer.data
            })

        return Response(response_data, status=status.HTTP_200_OK)

#FUNÇÃO PARA PÁGINA DE ASSESSORIOS(RETORNA APENAS A CATEGORIA FEMININA SEPARADA POR ITENS)
class ProdutosAcessoriosView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categoria = Categoria.objects.filter(slug='acessorios').first()
        if not categoria:
            return Response({"detail": "Categoria Acessórios não encontrada."}, status=status.HTTP_404_NOT_FOUND)
        
        produtos = Produto.objects.filter(categoria=categoria).select_related('tipo')
        produtos_por_tipo = defaultdict(list)

        for produto in produtos:
            produtos_por_tipo[produto.tipo.nome].append(produto)

        response_data = []
        for tipo_nome, produtos in produtos_por_tipo.items():
            serializer = ProdutoSerializer(produtos, many=True)
            response_data.append({
                'tipo': tipo_nome,
                'produtos': serializer.data
            })

        return Response(response_data, status=status.HTTP_200_OK)
    