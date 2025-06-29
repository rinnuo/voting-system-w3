from django.db import models

class Candidatura(models.Model):
    partido = models.ForeignKey('PartidoPolitico', on_delete=models.CASCADE, related_name='candidaturas')
    cargo = models.ForeignKey('Cargo', on_delete=models.CASCADE, related_name='candidaturas')
    nombres = models.CharField(max_length=200)
    ci = models.CharField(max_length=20, unique=True)
    foto = models.ImageField(upload_to='candidatos_fotos/')
    secciones = models.ManyToManyField('Seccion')  # cada candidato puede postularse en múltiples secciones

    def __str__(self):
        return f"{self.nombres} ({self.partido.sigla}) - {self.cargo.nombre}"