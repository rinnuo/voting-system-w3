from django.db import models

class MesaElectoral(models.Model):
    numero = models.PositiveIntegerField()
    recinto = models.ForeignKey('Recinto', on_delete=models.CASCADE, related_name='mesas')
    eleccion = models.ForeignKey('Eleccion', on_delete=models.CASCADE, related_name='mesas')

    class Meta:
        unique_together = ('numero', 'recinto', 'eleccion') #para no repetir

    def __str__(self):
        return f"Mesa {self.numero} - {self.recinto.nombre} ({self.eleccion.nombre})"