from django.db import models
from django.db.models import JSONField

class Seccion(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    poligono = models.JSONField(blank=True, null=True)  # esto nos guarda una lista de coordenadas geojson-style

    def __str__(self):
        return self.nombre