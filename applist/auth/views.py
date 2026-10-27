from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.http import require_GET


# Только демонстрационные точки вокруг центра Ульяновска.
# Это НЕ координаты настоящих маршруток и не источник GPS.
DEMO_VEHICLES = [
    {"id": "demo-1", "route_number": "1", "lat": 54.3142, "lon": 48.4031},
    {"id": "demo-2", "route_number": "2", "lat": 54.3087, "lon": 48.3975},
    {"id": "demo-3", "route_number": "3", "lat": 54.3210, "lon": 48.4142},
    {"id": "demo-4", "route_number": "4", "lat": 54.3050, "lon": 48.4250},
]


def map_page(request):
    """Отображает карту с учебными, а не реальными, координатами."""
    return render(request, "map.html")


@require_GET
def demo_vehicle_locations(request):
    """Возвращает пример JSON-ответа для JavaScript карты."""
    now = timezone.now().isoformat()
    vehicles = [
        {
            **vehicle,
            "accuracy_m": 25,
            "updated_at": now,
            "is_demo": True,
        }
        for vehicle in DEMO_VEHICLES
    ]
    return JsonResponse({"mode": "demo", "vehicles": vehicles})


def login(request):
    return render(request, 'login.html')

def register(request):
    return render(request, 'register.html')
