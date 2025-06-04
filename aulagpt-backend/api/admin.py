from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import User, Class, UserClass, Documents, Tests, TestQuestion, TestAnswer, Activity

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    list_display = ('email', 'name', 'surname', 'role', 'is_staff')
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

    search_fields = ('email', 'name')
    ordering = ('email',)

@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ('class_id', 'class_name', 'acces_code')
    search_fields = ('class_name', 'acces_code')

@admin.register(UserClass)
class UserClassAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'class_id')
    search_fields = ('user_id__email', 'class_id__class_name')  # Busca por email y nombre de clase

@admin.register(Documents)
class DocumentsAdmin(admin.ModelAdmin):
    list_display = ('document_id', 'class_id', 'file_name', 'file_type', 'upload_date', 'drive_link')
    search_fields = ('file_name',)
    list_filter = ('file_type', 'upload_date')

@admin.register(Tests)
class TestsAdmin(admin.ModelAdmin):
    list_display = ('test_id', 'user_id', 'document_id', 'test_name', 'creation_date')
    search_fields = ('test_name',)
    list_filter = ('creation_date',)

@admin.register(TestQuestion)
class TestQuestionAdmin(admin.ModelAdmin):
    list_display = ('question_id', 'test_id', 'question_text', 'correct_option')
    search_fields = ('question_text',)

@admin.register(TestAnswer)
class TestAnswerAdmin(admin.ModelAdmin):
    list_display = ('answer_id', 'user', 'test', 'question', 'selected_option', 'is_correct', 'answer_date')
    search_fields = ('user__email',)

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('activity_id', 'user', 'activity_type', 'timestamp')
    search_fields = ('user__email',)
    list_filter = ('activity_type', 'timestamp')
