from django.db import models

class Cargo(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    eleccion = models.ForeignKey('Eleccion', on_delete=models.CASCADE, related_name='cargos')  # Reemplaza '1' con el ID de la instancia inicial
    secciones = models.ManyToManyField('Seccion',blank=True)

    def __str__(self):
        return self.nombre