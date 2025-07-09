from django.contrib import admin

# Register your models here.
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Tournament, Team, Player, Match, MatchResult


class UserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {"fields": ("username", "password", "role")}),
        ("Personal info", {"fields": ("first_name", "last_name", "nickname", "email")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    list_display = BaseUserAdmin.list_display[0:-2] + ("nickname", "role", "is_staff") # type: ignore
    list_filter = BaseUserAdmin.list_filter + ("role",) # type: ignore
    search_fields = BaseUserAdmin.search_fields + ("nickname",) # type: ignore


admin.site.register(User, UserAdmin)
admin.site.register(Tournament)
admin.site.register(Team)
admin.site.register(Player)
admin.site.register(Match)
admin.site.register(MatchResult)
