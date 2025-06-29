# Generated by Django 5.1.7 on 2025-06-29 05:36

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('electoral', '0004_alter_partidopolitico_color_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Seccion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100)),
                ('descripcion', models.TextField(blank=True)),
                ('poligono', models.JSONField(blank=True, null=True)),
            ],
        ),
        migrations.AlterField(
            model_name='partidopolitico',
            name='nombre',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name='recinto',
            name='nombre',
            field=models.CharField(max_length=200, unique=True),
        ),
        migrations.CreateModel(
            name='Candidatura',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombres', models.CharField(max_length=200)),
                ('ci', models.CharField(max_length=20, unique=True)),
                ('foto', models.ImageField(upload_to='candidatos_fotos/')),
                ('cargo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='candidaturas', to='electoral.cargo')),
                ('partido', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='candidaturas', to='electoral.partidopolitico')),
                ('secciones', models.ManyToManyField(to='electoral.seccion')),
            ],
        ),
        migrations.AddField(
            model_name='cargo',
            name='secciones',
            field=models.ManyToManyField(blank=True, to='electoral.seccion'),
        ),
    ]
