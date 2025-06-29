from django.db import models

class Eleccion(models.Model):
    TIPO_CHOICES = [
        ('NACIONAL', 'Nacional'),
        ('MUNICIPAL', 'Municipal'),
        ('REGIONAL', 'Regional'),
    ]

    nombre = models.CharField(max_length=200)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    fecha = models.DateField()
    secciones = models.ManyToManyField('Seccion', blank=True)

    def __str__(self):
        return f"{self.nombre} - {self.fecha}"