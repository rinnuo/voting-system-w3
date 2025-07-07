from django.db import models

class Recinto(models.Model):
    nombre = models.CharField(max_length=200)
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lng = models.DecimalField(max_digits=9, decimal_places=6)
    seccion = models.ForeignKey('Seccion',on_delete=models.SET_NULL,null=True,related_name='recintos')  # ← nueva FK

    def __str__(self):
        return self.nombre