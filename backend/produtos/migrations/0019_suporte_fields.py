from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('produtos', '0018_whatsapporder'),
    ]

    operations = [
        migrations.AddField(
            model_name='suporte',
            name='produto_nome',
            field=models.CharField(blank=True, default='', max_length=150),
        ),
        migrations.AddField(
            model_name='suporte',
            name='resposta',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='suporte',
            name='respondido_em',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='suporte',
            name='respondido_por',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='respostas_suporte', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='suporte',
            name='status',
            field=models.CharField(choices=[('aberto', 'Aberto'), ('em_andamento', 'Em andamento'), ('encerrado', 'Encerrado')], default='aberto', max_length=20),
        ),
        migrations.AddField(
            model_name='suporte',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterField(
            model_name='suporte',
            name='contato',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AlterField(
            model_name='suporte',
            name='email',
            field=models.EmailField(blank=True, default='', max_length=100),
        ),
        migrations.AlterField(
            model_name='suporte',
            name='telefone',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
    ]
