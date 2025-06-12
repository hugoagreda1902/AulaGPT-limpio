# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ping_db,
    UserViewSet,
    DocumentsViewSet,
    TestsViewSet,
    TestQuestionViewSet,
    TestAnswerViewSet,
    ActivityViewSet,
    StudentTeacherViewSet,
    CustomTokenObtainPairView,
    AskAPIView,
    ProgressViewSet
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'documents', DocumentsViewSet, basename='documents')
router.register(r'tests', TestsViewSet, basename='tests')
router.register(r'testquestions', TestQuestionViewSet, basename='testquestions')
router.register(r'testanswers', TestAnswerViewSet, basename='testanswers')
router.register(r'activities', ActivityViewSet, basename='activities')
router.register(r'student-teachers', StudentTeacherViewSet, basename='studentteacher')
router.register(r'progress', ProgressViewSet, basename='progress'))

urlpatterns = [
    path('', include(router.urls)),
    path('ping-db/', ping_db, name='ping_db'),

    # Endpoint para preguntas a la IA
    path('ask/', AskAPIView.as_view(), name='ask'),

    # JWT Authentication endpoints
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]