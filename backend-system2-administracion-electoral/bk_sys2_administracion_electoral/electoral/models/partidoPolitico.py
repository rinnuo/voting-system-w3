from django.db import models

class PartidoPolitico(models.Model):
    nombre = models.CharField(max_length=100)
    sigla = models.CharField(max_length=20, unique=True)
    color = models.CharField(max_length=10, unique=True)  # Hex(#FF5733)

    def __str__(self):
        return f"{self.sigla} - {self.nombre}"