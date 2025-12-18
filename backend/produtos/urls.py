from django.urls import path
from .views import PedidoIntencaoListAdminView

urlpatterns = [
    path('intencoes-compra/', PedidoIntencaoListAdminView.as_view(), name='intencoes-compra-list-admin'),
]
