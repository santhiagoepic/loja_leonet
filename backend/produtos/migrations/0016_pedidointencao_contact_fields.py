from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('produtos', '0015_allowedrating'),
    ]

    operations = [
        migrations.AddField(
            model_name='pedidointencao',
            name='nome_contato',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='pedidointencao',
            name='telefone_contato',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='pedidointencao',
            name='endereco_entrega',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='pedidointencao',
            name='observacoes_cliente',
            field=models.TextField(blank=True),
        ),
    ]
