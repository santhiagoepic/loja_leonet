from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('produtos', '0017_alter_suporte_options_suporte_created_at_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='WhatsAppOrder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('customer_phone', models.CharField(max_length=20)),
                ('status', models.CharField(choices=[('created', 'Registrado'), ('sent', 'Mensagem enviada'), ('failed', 'Falha no envio')], default='created', max_length=20)),
                ('product_name_snapshot', models.CharField(max_length=255)),
                ('product_price_snapshot', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('product_url', models.URLField(blank=True)),
                ('image_url', models.URLField(blank=True)),
                ('message_preview', models.TextField(blank=True)),
                ('gateway_payload', models.JSONField(blank=True, default=dict)),
                ('error_detail', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('sent_at', models.DateTimeField(blank=True, null=True)),
                ('produto', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='whatsapp_orders', to='produtos.produto')),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='whatsapp_orders', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
                'verbose_name': 'Envio automatizado (WhatsApp)',
                'verbose_name_plural': 'Envios automatizados (WhatsApp)',
            },
        ),
    ]
