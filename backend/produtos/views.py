import logging
from collections import defaultdict
from urllib.parse import urljoin

from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import (
    Categoria,
    Produto,
    Banner,
    Contato,
    Suporte,
    TipoAvaliacao,
    Avaliacao,
    PedidoIntencao,
    AllowedRating,
    WhatsAppOrder,
)
from .serializers import (
    CategoriaSerializer,
    ProdutoSerializer,
    BannerSerializer,
    ContatoSerializer,
    AvaliacaoSerializer,
    AvaliacaoListSerializer,
    SuporteSerializer,
    PedidoIntencaoSerializer,
    PedidoIntencaoAdminSerializer,
    WhatsAppInquirySerializer,
    WhatsAppOrderRequestSerializer,
    WhatsAppOrderSerializer,
)
from .waha import WhatsAppGateway, WhatsAppGatewayError

logger = logging.getLogger(__name__)


# ViewSet para Produto (com CRUD completo + ação de destaque)
class ProdutoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        termo = (self.request.query_params.get('search') or '').strip()
        if termo:
            queryset = queryset.filter(nome__icontains=termo)
        return queryset

    def get_permissions(self):
        # leitura liberada ao público; demais ações (se declaradas futuramente) apenas para admin
        if self.action in ['list', 'retrieve', 'destaques']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

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


class ProdutosMasculinaView(ProdutosFemininaView):
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


class ProdutosInfantilView(ProdutosFemininaView):
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


class ProdutosAcessoriosView(ProdutosFemininaView):
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


class AvaliacaoAPIView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, produto_id=None, pk=None):
        queryset = Avaliacao.objects.select_related('tipo_avaliacao', 'usuario')

        if pk is not None:
            avaliacao = get_object_or_404(queryset, pk=pk)
            return Response(AvaliacaoSerializer(avaliacao).data)

        produto_id = produto_id or request.query_params.get('produto_id')
        if produto_id:
            queryset = queryset.filter(produto_id=produto_id)

        serializer = AvaliacaoListSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request, produto_id=None):
        if not request.user.is_authenticated:
            return Response({'detail': 'Autenticação necessária.'}, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data
        errors = {}

        produto_id = produto_id or data.get('produto_id')
        tipo_avaliacao_id = data.get('tipo_avaliacao_id')
        nota = data.get('nota')

        if not produto_id:
            errors['produto_id'] = ['Este campo é obrigatório.']
        if not tipo_avaliacao_id:
            errors['tipo_avaliacao_id'] = ['Este campo é obrigatório.']
        if nota is None:
            errors['nota'] = ['Este campo é obrigatório.']

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        produto = get_object_or_404(Produto, pk=produto_id)
        tipo_avaliacao = get_object_or_404(TipoAvaliacao, pk=tipo_avaliacao_id)

        try:
            nota = int(nota)
        except (TypeError, ValueError):
            return Response({'nota': ['A nota deve ser um número inteiro.']}, status=status.HTTP_400_BAD_REQUEST)

        if nota < 1 or nota > 10:
            return Response({'nota': ['A nota deve estar entre 1 e 10.']}, status=status.HTTP_400_BAD_REQUEST)

        if Avaliacao.objects.filter(produto=produto, usuario=request.user).exists():
            return Response({'detail': 'Você já avaliou este produto.'}, status=status.HTTP_400_BAD_REQUEST)

        foto_produto = request.FILES.get('foto_produto')
        if not foto_produto:
            return Response({'foto_produto': ['Envie uma imagem do produto recebido.']}, status=status.HTTP_400_BAD_REQUEST)

        allowed_rating = AllowedRating.objects.filter(
            usuario=request.user,
            produto=produto,
            used_at__isnull=True,
        ).first()

        if not allowed_rating:
            return Response(
                {'detail': 'Finalize a compra para liberar a avaliação deste produto.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if allowed_rating.is_expired:
            allowed_rating.delete()
            return Response(
                {'detail': 'O prazo para avaliar este produto expirou.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        nome_completo = data.get('nome_completo') or request.user.get_full_name() or request.user.email or request.user.username
        comentario = data.get('comentario', '')

        avaliacao = Avaliacao.objects.create(
            produto=produto,
            tipo_avaliacao=tipo_avaliacao,
            nota=nota,
            nome_completo=nome_completo,
            comentario=comentario,
            foto_produto=foto_produto,
            usuario=request.user,
        )

        allowed_rating.mark_used()

        return Response(AvaliacaoSerializer(avaliacao).data, status=status.HTTP_201_CREATED)

    def patch(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({'detail': 'Autenticação necessária.'}, status=status.HTTP_401_UNAUTHORIZED)
        if not request.user.is_staff:
            return Response({'detail': 'Acesso restrito.'}, status=status.HTTP_403_FORBIDDEN)
        if not pk:
            return Response({'detail': 'ID da avaliação é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

        avaliacao = get_object_or_404(Avaliacao, pk=pk)

        compra_verificada = request.data.get('compra_verificada')
        comentario = request.data.get('comentario')
        nota = request.data.get('nota')

        if compra_verificada is not None:
            compra_verificada_value = str(compra_verificada).lower() in ['true', '1', 'sim']
            if compra_verificada_value:
                possui_compra = PedidoIntencao.objects.filter(
                    usuario=avaliacao.usuario,
                    produto=avaliacao.produto,
                    status=PedidoIntencao.Status.CONCLUIDA
                ).exists()
                if not possui_compra:
                    return Response(
                        {'detail': 'Não há compra concluída registrada para esta avaliação.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                avaliacao.compra_verificada = True
                avaliacao.verificado_por = request.user
                avaliacao.verificado_em = timezone.now()
            else:
                avaliacao.compra_verificada = False
                avaliacao.verificado_por = None
                avaliacao.verificado_em = None

        if comentario is not None:
            avaliacao.comentario = comentario

        if nota is not None:
            try:
                nota_int = int(nota)
            except (TypeError, ValueError):
                return Response({'nota': ['A nota deve ser um número inteiro.']}, status=status.HTTP_400_BAD_REQUEST)
            if nota_int < 1 or nota_int > 10:
                return Response({'nota': ['A nota deve estar entre 1 e 10.']}, status=status.HTTP_400_BAD_REQUEST)
            avaliacao.nota = nota_int

        avaliacao.save()
        return Response(AvaliacaoSerializer(avaliacao).data)

    def delete(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({'detail': 'Autenticação necessária.'}, status=status.HTTP_401_UNAUTHORIZED)
        avaliacao = get_object_or_404(Avaliacao, pk=pk)
        if not (request.user.is_staff or avaliacao.usuario == request.user):
            return Response({'detail': 'Sem permissão para remover esta avaliação.'}, status=status.HTTP_403_FORBIDDEN)
        avaliacao.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class SuporteAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        suportes = Suporte.objects.select_related('usuario', 'produto')
        if not request.user.is_staff:
            suportes = suportes.filter(usuario=request.user)
        serializer = SuporteSerializer(suportes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SuporteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        suporte = serializer.save(usuario=request.user)
        output_serializer = SuporteSerializer(suporte)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class WhatsAppRelayView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = WhatsAppInquirySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        message = self._build_message(data)

        try:
            gateway = WhatsAppGateway()
            gateway.send_product_message(
                chat_phone=data['customer_phone'],
                text=message,
                image_url=data.get('image_url'),
                filename=data.get('image_name'),
            )
        except WhatsAppGatewayError as exc:
            logger.exception('WAHA indisponível: %s', exc)
            return Response({'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response({'detail': 'Mensagem enviada com sucesso.'}, status=status.HTTP_202_ACCEPTED)

    @staticmethod
    def _build_message(data):
        linhas = [
            '🛍️ *INTERESSE NO PRODUTO* 🛍️',
            '',
            f"*Produto:* {data['product_name']}",
        ]
        descricao = data.get('product_description')
        if descricao:
            linhas.append(f"*Descrição:* {descricao}")
        preco = data.get('product_price')
        if preco:
            linhas.append(f"*Preço:* {preco}")
        link = data.get('product_url')
        if link:
            linhas.append(f"*Link:* {link}")
        linhas.extend([
            '',
            'Cliente interessado através do site. Favor prosseguir com o atendimento.',
        ])
        extra = data.get('extra_notes')
        if extra:
            linhas.extend(['', extra])
        return '\n'.join(linhas)


class WhatsAppOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = WhatsAppOrderRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        produto = serializer.validated_data['produto']

        phone = self._resolve_customer_phone(request.user)
        if not phone:
            return Response(
                {'detail': 'Atualize seu telefone na área "Minha Conta" para continuar.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product_url = self._build_product_url(request, produto)
        image_url = self._resolve_image_url(produto)
        message = self._build_customer_message(request.user, produto, product_url)

        order = WhatsAppOrder.objects.create(
            usuario=request.user,
            produto=produto,
            customer_phone=phone,
            product_name_snapshot=produto.nome,
            product_price_snapshot=produto.preco,
            product_url=product_url,
            image_url=image_url or '',
            message_preview=message,
        )

        try:
            gateway = WhatsAppGateway()
            payload = gateway.send_product_message(
                chat_phone=phone,
                text=message,
                image_url=image_url or None,
                filename=self._image_filename(image_url),
            ) or {}
            order.mark_sent(payload=payload, message_preview=message)
            response_status = status.HTTP_202_ACCEPTED
            detail = 'Enviamos os detalhes deste produto no seu WhatsApp.'
            feedback_status = 'success'
            feedback_title = 'Pedido enviado'
        except WhatsAppGatewayError as exc:
            order.mark_failed(str(exc))
            response_status = status.HTTP_503_SERVICE_UNAVAILABLE
            detail = 'Não foi possível disparar a mensagem agora. Tente novamente em instantes.'
            feedback_status = 'error'
            feedback_title = 'Ops, algo aconteceu'

        data = {
            'order': WhatsAppOrderSerializer(order).data,
            'feedback': {
                'status': feedback_status,
                'title': feedback_title,
                'message': detail,
            },
        }
        return Response(data, status=response_status)

    @staticmethod
    def _resolve_customer_phone(user):
        profile = getattr(user, 'customer_profile', None)
        if not profile:
            return None
        digits = ''.join(filter(str.isdigit, profile.phone_number or ''))
        if len(digits) < 10:
            return None
        return digits

    @staticmethod
    def _build_product_url(request, produto):
        base = getattr(settings, 'FRONTEND_BASE_URL', '') or request.build_absolute_uri('/')
        base = base.rstrip('/') + '/'
        path = f"produto/{produto.id}/"
        return urljoin(base, path)

    @staticmethod
    def _resolve_image_url(produto):
        try:
            return produto.imagem.url
        except AttributeError:
            return ''

    @staticmethod
    def _image_filename(image_url):
        if not image_url:
            return None
        return image_url.rstrip('/').split('/')[-1] or 'produto.jpg'

    @staticmethod
    def _build_customer_message(user, produto, product_url):
        customer_name = getattr(user, 'customer_profile', None)
        display_name = None
        if customer_name and customer_name.full_name:
            display_name = customer_name.full_name
        if not display_name:
            display_name = user.get_full_name() or user.email or user.username
        linhas = [
            '🛒 *PEDIDO RECEBIDO*',
            '',
            f'*Cliente:* {display_name}',
            f'*Produto:* {produto.nome}',
        ]
        if produto.descricao:
            linhas.append(f'*Descrição:* {produto.descricao[:200]}')
        if produto.preco is not None:
            linhas.append(f"*Preço no site:* R$ {produto.preco:.2f}")
        linhas.extend([
            f'*Link:* {product_url}',
            '',
            'Nosso atendimento já recebeu seu interesse e seguirá com os próximos passos pelo próprio WhatsApp.',
            'Se esta mensagem chegou por engano, ignore-a.',
        ])
        return '\n'.join(linhas)


class PedidoIntencaoViewSet(viewsets.ModelViewSet):
    queryset = PedidoIntencao.objects.select_related('usuario', 'produto')
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_staff:
            return qs
        return qs.filter(usuario=self.request.user)

    def get_serializer_class(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return PedidoIntencaoAdminSerializer
        return PedidoIntencaoSerializer

    def create(self, request, *args, **kwargs):
        input_serializer = PedidoIntencaoSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        produto = input_serializer.validated_data['produto']
        nome_contato = input_serializer.validated_data.get('nome_contato')
        telefone_contato = input_serializer.validated_data.get('telefone_contato', '')
        endereco_entrega = input_serializer.validated_data.get('endereco_entrega', '')
        observacoes_cliente = input_serializer.validated_data.get('observacoes_cliente', '')

        intencao = PedidoIntencao.objects.create(
            usuario=request.user,
            produto=produto,
            nome_contato=nome_contato or getattr(request.user, 'full_name', '') or request.user.get_full_name(),
            telefone_contato=telefone_contato,
            endereco_entrega=endereco_entrega,
            observacoes_cliente=observacoes_cliente,
        )

        output_serializer = self.get_serializer(intencao)
        headers = self.get_success_headers(output_serializer.data)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response({'detail': 'Apenas administradores podem atualizar intenções.'}, status=status.HTTP_403_FORBIDDEN)

        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        status_value = serializer.validated_data.get('status', instance.status)
        observacoes = serializer.validated_data.get('observacoes_admin', instance.observacoes_admin)

        instance.status = status_value
        instance.observacoes_admin = observacoes
        instance.confirmado_por = request.user
        instance.confirmado_em = timezone.now()
        instance.save(update_fields=['status', 'observacoes_admin', 'confirmado_por', 'confirmado_em', 'atualizado_em'])
        instance.sync_allowed_rating()

        return Response(self.get_serializer(instance).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if request.user.is_staff:
            AllowedRating.objects.filter(
                usuario=instance.usuario,
                produto=instance.produto,
                used_at__isnull=True,
            ).delete()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)

        if instance.usuario != request.user:
            return Response({'detail': 'Sem permissão para remover esta intenção.'}, status=status.HTTP_403_FORBIDDEN)

        if instance.status != PedidoIntencao.Status.AGUARDANDO:
            return Response({'detail': 'Somente pedidos pendentes podem ser cancelados.'}, status=status.HTTP_400_BAD_REQUEST)

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
