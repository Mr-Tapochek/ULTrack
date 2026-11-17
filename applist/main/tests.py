from django.test import TestCase


class MapPageTests(TestCase):
    def test_home_page_renders_map_and_demo_warning(self):
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'id="map"')
        self.assertContains(response, "Демо, не слежение за транспортом.")

    def test_demo_vehicle_endpoint_returns_json(self):
        response = self.client.get("/api/demo/vehicles/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertEqual(response.json()["mode"], "demo")
        self.assertEqual(len(response.json()["vehicles"]), 4)
        self.assertTrue(all(vehicle["is_demo"] for vehicle in response.json()["vehicles"]))

    def test_demo_vehicle_endpoint_rejects_post(self):
        response = self.client.post("/api/demo/vehicles/", data={})

        self.assertEqual(response.status_code, 405)
