from django.db import models

class Papeleta(models.Model):
    eleccion = models.ForeignKey('Eleccion', on_delete=models.CASCADE, related_name='papeletas')
    seccion = models.ForeignKey('Seccion', on_delete=models.CASCADE)
    cargo = models.ForeignKey('Cargo', on_delete=models.CASCADE)
    candidaturas = models.ManyToManyField('Candidatura')

    class Meta:
        unique_together = ('eleccion', 'seccion', 'cargo')

    def __str__(self):
        return f"{self.cargo.nombre} - {self.seccion.nombre} ({self.eleccion.nombre})"