from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('PADRON', 'Admin Padrón'),
        ('ELECCION', 'Admin Elecciones'),
        ('JURADO', 'Jurado Electoral'),
        ('SUPER', 'Super Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
