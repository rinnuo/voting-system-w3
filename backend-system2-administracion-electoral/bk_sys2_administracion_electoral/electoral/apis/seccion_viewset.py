from rest_framework import serializers
from electoral.models import Seccion
from electoral.apis.base.permission_serializer import EleccionBaseViewSet, IsEleccionUser
from rest_framework.permissions import AllowAny

class SeccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seccion
        fields = ['id', 'nombre', 'descripcion', 'poligono']

class SeccionViewSet(EleccionBaseViewSet):
    serializer_class = SeccionSerializer
    queryset = Seccion.objects.all()

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]
        return [IsEleccionUser()]

    def validate_poligono(self, value):
        if not isinstance(value, list) or len(value) < 3:
            raise serializers.ValidationError("Debe contener al menos 3 coordenadas.")
        return value