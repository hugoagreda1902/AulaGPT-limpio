from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ping_db, UserViewSet, ClassViewSet, UserClassViewSet,
    DocumentsViewSet, UploadDocumentView, TestsViewSet, TestQuestionViewSet,
    TestAnswerViewSet, ActivityViewSet,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'classes', ClassViewSet)
router.register(r'userclasses', UserClassViewSet)
router.register(r'documents', DocumentsViewSet, basename='documents')
router.register(r'tests', TestsViewSet)
router.register(r'testquestions', TestQuestionViewSet)
router.register(r'testanswers', TestAnswerViewSet)
router.register(r'activities', ActivityViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('ping-db/', ping_db, name='ping_db'),
    path('uploadDocument/', UploadDocumentView.as_view(), name='uploadDocument'),

    # JWT Authentication
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

]