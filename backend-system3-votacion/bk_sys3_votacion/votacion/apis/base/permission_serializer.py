from rest_framework.permissions import BasePermission
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.models import TokenUser
from rest_framework.exceptions import AuthenticationFailed
from votacion.authentication import ExternalJWTAuthentication
from rest_framework.response import Response
from rest_framework import status
#esta hoja se encarga de controlar los permisos del resto de los viewsets

class IsJuradoUser(BasePermission):
    PUBLIC_ACTIONS = {'estado', 'resultados', 'buscar'}

    def has_permission(self, request, view):
        action = getattr(view, 'action', None)

        # 1) Si es una acción pública, siempre permitir
        if action in self.PUBLIC_ACTIONS:
            return True

        # 2) Si no es pública, debe venir autenticado y ser JURADO
        token = getattr(request, 'auth', None)
        if not token:
            return False

        # El payload de tu token externo trae el campo 'role'
        return token.payload.get('role') == 'JURADO'



class JuradoBaseViewSet(ModelViewSet):
    authentication_classes = [ExternalJWTAuthentication]

    def initialize_request(self, request, *args, **kwargs):
        try:
            req = super().initialize_request(request, *args, **kwargs)
            if hasattr(req, 'auth') and req.auth and not hasattr(req, 'user'):
                req.user = TokenUser(req.auth)
            return req
        except AuthenticationFailed:
            return Response({'detail': 'Token inválido o expirado'}, status=status.HTTP_401_UNAUTHORIZED)
