from django.contrib import admin

from mail.models import Email, User


class EmailAdmin(admin.ModelAdmin):
    filter_horizontal = ("recipients", )

# Register your models here.
admin.site.register(User)
admin.site.register(Email, EmailAdmin)
