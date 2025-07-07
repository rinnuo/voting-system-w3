from rest_framework import serializers
from rest_framework.permissions import AllowAny
from electoral.apis.base import EleccionBaseViewSet, IsEleccionUser
from electoral.models import Eleccion

class EleccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Eleccion
        fields = ['id', 'nombre', 'tipo', 'fecha', 'activa','secciones']

class EleccionViewSet(EleccionBaseViewSet):
    serializer_class = EleccionSerializer
    queryset = Eleccion.objects.all()

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]
        return [IsEleccionUser()]

