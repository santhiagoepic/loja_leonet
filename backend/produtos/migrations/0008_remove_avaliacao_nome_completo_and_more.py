# Generated by Django 5.2.1 on 2025-05-27 11:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('produtos', '0007_remove_avaliacao_cpf'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='avaliacao',
            name='nome_completo',
        ),
        migrations.RemoveField(
            model_name='avaliacao',
            name='telefone',
        ),
        migrations.AddField(
            model_name='avaliacao',
            name='nota',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
    ]
