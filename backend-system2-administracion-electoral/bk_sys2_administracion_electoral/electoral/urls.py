from rest_framework.routers import DefaultRouter
from .apis import RecintoViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'admin/recintos', RecintoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
