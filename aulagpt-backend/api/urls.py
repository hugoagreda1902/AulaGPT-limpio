# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ping_db, UserViewSet, DocumentsViewSet, TestsViewSet, TestQuestionViewSet,
    TestAnswerViewSet, ActivityViewSet, CustomTokenObtainPairView, AskAPIView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'documents', DocumentsViewSet, basename='documents')
router.register(r'tests', TestsViewSet)
router.register(r'testquestions', TestQuestionViewSet)
router.register(r'testanswers', TestAnswerViewSet)
router.register(r'activities', ActivityViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('ping-db/', ping_db, name='ping_db'),

    # Endpoint para preguntas a la IA
    path('ask/', AskAPIView.as_view(), name='ask'),

    # JWT Authentication endpoints
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
