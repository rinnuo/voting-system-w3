from django.db import models

from votacion.models import Papeleta


class Voto(models.Model):
    papeleta       = models.OneToOneField(Papeleta, on_delete=models.CASCADE)
    candidatura_id = models.IntegerField()    # id de la candidatura en SIS 2
    timestamp      = models.DateTimeField(auto_now_add=True)