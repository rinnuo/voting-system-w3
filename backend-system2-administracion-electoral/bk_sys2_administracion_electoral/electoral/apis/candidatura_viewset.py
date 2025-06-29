from rest_framework import serializers
from electoral.models import Candidatura
from electoral.apis.base.permission_serializer import EleccionBaseViewSet, IsEleccionUser
from rest_framework.permissions import AllowAny

class CandidaturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidatura
        fields = ['id', 'nombres', 'ci', 'foto', 'partido', 'cargo', 'secciones']

class CandidaturaViewSet(EleccionBaseViewSet):
    serializer_class = CandidaturaSerializer
    queryset = Candidatura.objects.all()

    def get_permissions(self):
        if self.request.method in ['GET', 'HEAD', 'OPTIONS']:
            return [AllowAny()]
        return [IsEleccionUser()]