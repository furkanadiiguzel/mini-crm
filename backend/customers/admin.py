from django.contrib import admin
from .models import Customer, Note, Opportunity


class NoteInline(admin.TabularInline):
    model = Note
    extra = 0
    readonly_fields = ("created_by", "created_at")


class OpportunityInline(admin.TabularInline):
    model = Opportunity
    extra = 0
    readonly_fields = ("created_at",)


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "email", "company", "is_active", "created_at")
    list_filter = ("is_active", "created_at", "company")
    search_fields = ("first_name", "last_name", "email", "company")
    list_per_page = 20
    readonly_fields = ("created_at", "updated_at")
    inlines = [NoteInline, OpportunityInline]
    actions = ["soft_delete_selected", "activate_selected"]

    @admin.action(description="Seçili müşterileri soft delete yap")
    def soft_delete_selected(self, request, queryset):
        queryset.update(is_active=False)

    @admin.action(description="Seçili müşterileri aktif et")
    def activate_selected(self, request, queryset):
        queryset.update(is_active=True)


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ("customer", "created_by", "short_content", "created_at")
    list_filter = ("created_at", "created_by")
    search_fields = ("content", "customer__first_name", "customer__last_name")

    @admin.display(description="Content")
    def short_content(self, obj):
        return obj.content[:50]


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ("title", "customer", "amount", "stage", "assigned_to", "expected_close")
    list_filter = ("stage", "assigned_to", "expected_close")
    search_fields = ("title", "customer__first_name", "customer__last_name")
    list_editable = ("stage",)
