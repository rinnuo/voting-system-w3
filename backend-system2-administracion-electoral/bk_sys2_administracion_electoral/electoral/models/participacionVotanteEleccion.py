from django.db import models

class ParticipacionVotanteEleccion(models.Model):
    votante_id = models.UUIDField(unique=True)   # mismo GUID que genera Sistema 1
    nombre_completo = models.CharField(
        max_length=200,
        blank=True,
        help_text="Nombre completo del votante"
    )
    apellido_paterno = models.CharField(
        max_length=100,
        blank=True,
        help_text="Apellido paterno extraído"
    )
    eleccion   = models.ForeignKey(
                    'Eleccion',
                    on_delete=models.CASCADE,
                    related_name='participaciones'
                 )
    seccion    = models.ForeignKey(
                    'Seccion',
                    on_delete=models.SET_NULL,
                    null=True
                 )
    recinto    = models.ForeignKey(
                    'Recinto',
                    on_delete=models.SET_NULL,
                    null=True
                 )
    mesa       = models.ForeignKey(
                    'MesaElectoral',
                    on_delete=models.SET_NULL,
                    null=True,
                    blank=True,
                    related_name='asignaciones'
                 )
    voto_emitido = models.BooleanField(default=False)

    class Meta:
        unique_together = ('votante_id', 'eleccion')