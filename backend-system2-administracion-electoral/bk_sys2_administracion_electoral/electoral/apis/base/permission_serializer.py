from rest_framework.permissions import BasePermission
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.models import TokenUser
from rest_framework.exceptions import AuthenticationFailed
from electoral.authentication import ExternalJWTAuthentication
from rest_framework.response import Response
from rest_framework import status
#esta hoja se encarga de controlar los permisos del resto de los viewsets

class IsEleccionUser(BasePermission):
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        token = getattr(request, 'auth', None)
        return token and token.payload.get('role') == 'ELECCION'


class EleccionBaseViewSet(ModelViewSet):
    authentication_classes = [ExternalJWTAuthentication]

    def initialize_request(self, request, *args, **kwargs):
        try:
            req = super().initialize_request(request, *args, **kwargs)
            if hasattr(req, 'auth') and req.auth and not hasattr(req, 'user'):
                req.user = TokenUser(req.auth)
            return req
        except AuthenticationFailed:
            return Response({'detail': 'Token inválido o expirado'}, status=status.HTTP_401_UNAUTHORIZED)
