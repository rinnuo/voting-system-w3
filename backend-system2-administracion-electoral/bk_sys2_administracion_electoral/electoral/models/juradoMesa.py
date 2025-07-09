from django.db import models
from electoral.models import MesaElectoral

class JuradoMesa(models.Model):
    participante_id = models.ForeignKey(
        'ParticipacionVotanteEleccion',
        on_delete=models.CASCADE,
        to_field='votante_id',
        db_column='participante_id'
    )
    mesa = models.ForeignKey(
        'MesaElectoral',
        on_delete=models.CASCADE,
        related_name='jurados'
    )
    user4_id = models.IntegerField(
        help_text="ID del CustomUser creado en Sistema 4"
    )
    username = models.CharField(max_length=150)

    class Meta:
        unique_together = ('participante_id', 'mesa')
        verbose_name = "Asignación Jurado–Mesa"
        verbose_name_plural = "Asignaciones Jurado–Mesa"