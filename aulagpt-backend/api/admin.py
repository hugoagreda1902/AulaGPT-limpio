from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import (
    User, Class, UserClass, Documents, Tests, TestQuestion,
    TestAnswer, Activity, ChatHistory
)

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    list_display = ('email', 'name', 'surname', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_superuser')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información personal', {'fields': ('name', 'surname', 'role')}),
        ('Permisos', {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'surname', 'role', 'password1', 'password2', 'is_staff', 'is_superuser'),
        }),
    )

    search_fields = ('email', 'name', 'surname')
    ordering = ('email',)

@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ('class_id', 'class_name', 'access_code', 'drive_folder_id')
    search_fields = ('class_name', 'access_code')

@admin.register(UserClass)
class UserClassAdmin(admin.ModelAdmin):
    list_display = ('user', 'class_obj')
    search_fields = ('user__email', 'class_obj__class_name')

@admin.register(Documents)
class DocumentsAdmin(admin.ModelAdmin):
    list_display = ('document_id', 'file_name', 'owner', 'class_obj', 'subject', 'upload_date', 'drive_link')
    list_filter = ('class_obj', 'upload_date', 'file_type')
    search_fields = ('file_name', 'owner__email')

@admin.register(Tests)
class TestsAdmin(admin.ModelAdmin):
    list_display = ('test_id', 'test_name', 'creator', 'document', 'creation_date')
    list_filter = ('creator', 'creation_date')
    search_fields = ('test_name',)

@admin.register(TestQuestion)
class TestQuestionAdmin(admin.ModelAdmin):
    list_display = ('question_id', 'test', 'question_text', 'correct_option')
    search_fields = ('question_text',)

@admin.register(TestAnswer)
class TestAnswerAdmin(admin.ModelAdmin):
    list_display = ('answer_id', 'user', 'test', 'question', 'selected_option', 'is_correct', 'answer_date')
    list_filter = ('is_correct', 'answer_date')
    search_fields = ('user__email',)

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('activity_id', 'user', 'subject', 'activity_type', 'timestamp')
    list_filter = ('activity_type', 'timestamp')
    search_fields = ('user__email', 'subject__class_name')

@admin.register(ChatHistory)
class ChatHistoryAdmin(admin.ModelAdmin):
    list_display = ('history_id', 'user', 'subject', 'question', 'timestamp')
    list_filter = ('subject', 'timestamp')
    search_fields = ('user__email', 'question')
