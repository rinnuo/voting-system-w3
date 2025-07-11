from django.db import models
import uuid

class Papeleta(models.Model):
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    votante_id   = models.UUIDField()     # UUID del votante en SIS 1/SIS 2
    mesa_id      = models.IntegerField()  # id de MesaElectoral en SIS 2
    habilitada   = models.BooleanField(default=False)
    habilitada_por = models.IntegerField(null=True)  # user4_id del jurado
    habilitada_en  = models.DateTimeField(null=True)
    votada_en      = models.DateTimeField(null=True)
