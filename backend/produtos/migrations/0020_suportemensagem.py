from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('produtos', '0019_suporte_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='SuporteMensagem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo_autor', models.CharField(choices=[('cliente', 'Cliente'), ('admin', 'Admin')], default='cliente', max_length=20)),
                ('texto', models.TextField()),
                ('imagem', models.ImageField(blank=True, null=True, upload_to='suporte/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('autor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('suporte', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='mensagens', to='produtos.suporte')),
            ],
            options={
                'ordering': ['created_at'],
            },
        ),
    ]
