from rest_framework import serializers
from electoral.models import MesaElectoral
from electoral.apis.base.permission_serializer import EleccionBaseViewSet, IsEleccionUser
from rest_framework.permissions import AllowAny

class MesaElectoralSerializer(serializers.ModelSerializer):
    recinto_nombre = serializers.CharField(source='recinto.nombre', read_only=True)
    class Meta:
        model = MesaElectoral
        fields = ['id', 'numero', 'eleccion', 'recinto', 'recinto_nombre']

class MesaElectoralViewSet(EleccionBaseViewSet):
    serializer_class = MesaElectoralSerializer
    queryset = MesaElectoral.objects.all()

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]
        return [IsEleccionUser()]