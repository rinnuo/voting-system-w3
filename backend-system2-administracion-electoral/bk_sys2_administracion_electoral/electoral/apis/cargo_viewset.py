from rest_framework import serializers
from electoral.apis.base.permission_serializer import EleccionBaseViewSet, IsEleccionUser
from electoral.models import Cargo
from rest_framework.permissions import AllowAny

class CargoSerializer(serializers.ModelSerializer):
    eleccion_nombre = serializers.CharField(source='eleccion.nombre', read_only=True)
    class Meta:
        model = Cargo
        fields = ['id', 'nombre', 'descripcion', 'eleccion', 'secciones', 'eleccion_nombre']

class CargoViewSet(EleccionBaseViewSet):
    serializer_class = CargoSerializer
    queryset = Cargo.objects.all()

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]  #IsEleccionUser() si necesitamos proteger el GET
        return [IsEleccionUser()]