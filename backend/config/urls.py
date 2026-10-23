from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(request):
    return JsonResponse({"status": "ok"})


api_patterns = [
    path("health/", health_check, name="health"),
    path("properties/", include("properties.urls")),
    path("leads/", include("leads.urls")),
    path("followups/", include("followups.urls")),
    path("ai/", include("ai_engine.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(api_patterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
