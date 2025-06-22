from rest_framework.permissions import BasePermission

class IsEleccionUser(BasePermission):
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        token = getattr(request, 'auth', None)
        return token and token.payload.get('role') == 'ELECCION'