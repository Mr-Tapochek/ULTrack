from django.urls import path

from .views import demo_vehicle_locations, map_page


urlpatterns = [
    path('', map_page, name='map'),
    path('api/demo/vehicles/', demo_vehicle_locations, name='demo_vehicle_locations'),
]
