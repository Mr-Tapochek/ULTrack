// Behavior for the main map page.
(() => {
    "use strict";

    const mapElement = document.querySelector("#map");
    const statusElement = document.querySelector("#map-status");
    const listElement = document.querySelector("#vehicle-list");
    const countElement = document.querySelector("#vehicle-count");
    const refreshButton = document.querySelector("#refresh-button");

    if (!mapElement || !statusElement || !listElement || !countElement || !refreshButton) {
        return;
    }

    if (typeof L === "undefined") {
        statusElement.textContent = "Не загрузилась библиотека карты. Проверьте интернет и обновите страницу.";
        statusElement.dataset.state = "error";
        refreshButton.disabled = true;
        return;
    }

    const apiUrl = mapElement.dataset.apiUrl;
    const ulyanovskCenter = [54.3142, 48.4031];
    const markersById = new Map();
    let requestInProgress = false;

    const map = L.map(mapElement, {
        scrollWheelZoom: false,
    }).setView(ulyanovskCenter, 13);
    // Убираем подпись из правого нижнего угла, сохраняя обязательную атрибуцию OSM.
    map.attributionControl.setPosition("bottomleft");

    // В прототипе используем стандартный OSM tile endpoint.
    // Для production нужно выбрать источник тайлов с подходящими условиями и SLA.
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
    }).addTo(map);

    function setStatus(message, state = "") {
        statusElement.textContent = message;
        if (state) {
            statusElement.dataset.state = state;
        } else {
            delete statusElement.dataset.state;
        }
    }

    function isValidVehicle(vehicle) {
        return (
            vehicle &&
            typeof vehicle.id === "string" &&
            Number.isFinite(Number(vehicle.lat)) &&
            Number.isFinite(Number(vehicle.lon)) &&
            Number(vehicle.lat) >= -90 &&
            Number(vehicle.lat) <= 90 &&
            Number(vehicle.lon) >= -180 &&
            Number(vehicle.lon) <= 180
        );
    }

    function createRouteIcon(routeNumber) {
        // textContent не позволяет значению маршрута превратиться в HTML/скрипт.
        const badge = document.createElement("span");
        badge.className = "bus-marker-badge";
        badge.textContent = `№ ${routeNumber}`;

        return L.divIcon({
            className: "bus-marker-icon",
            html: badge,
            iconSize: [56, 36],
            iconAnchor: [28, 18],
        });
    }

    function createPopup(vehicle) {
        const content = document.createElement("div");
        const title = document.createElement("strong");
        const details = document.createElement("p");

        title.textContent = `Маршрут № ${vehicle.route_number}`;
        details.textContent = "Учебная точка — не реальная маршрутка.";
        content.append(title, details);

        return content;
    }

    function renderVehicleList(vehicles) {
        const fragment = document.createDocumentFragment();

        for (const vehicle of vehicles) {
            const item = document.createElement("li");
            const route = document.createElement("strong");
            const coordinates = document.createElement("span");

            item.className = "vehicle-item";
            route.textContent = `Маршрут № ${vehicle.route_number}`;
            coordinates.textContent =
                `Демо-координаты: ${Number(vehicle.lat).toFixed(4)}, ${Number(vehicle.lon).toFixed(4)}`;
            item.append(route, coordinates);
            fragment.append(item);
        }

        listElement.replaceChildren(fragment);
        countElement.textContent = String(vehicles.length);
    }

    function renderMarkers(vehicles) {
        const visibleIds = new Set();

        for (const vehicle of vehicles) {
            visibleIds.add(vehicle.id);
            const position = [Number(vehicle.lat), Number(vehicle.lon)];
            let marker = markersById.get(vehicle.id);

            if (!marker) {
                marker = L.marker(position, {
                    icon: createRouteIcon(vehicle.route_number),
                    title: `Демо-маршрут № ${vehicle.route_number}`,
                    alt: `Демонстрационная метка маршрута ${vehicle.route_number}`,
                }).addTo(map);
                markersById.set(vehicle.id, marker);
            } else {
                marker.setLatLng(position);
                marker.setIcon(createRouteIcon(vehicle.route_number));
            }

            marker.bindPopup(createPopup(vehicle));
        }

        for (const [id, marker] of markersById) {
            if (!visibleIds.has(id)) {
                marker.remove();
                markersById.delete(id);
            }
        }
    }

    async function loadDemoVehicles() {
        if (requestInProgress) {
            return;
        }

        requestInProgress = true;
        refreshButton.disabled = true;
        setStatus("Запрашиваю демонстрационные точки у Django-сервера…");

        try {
            const response = await fetch(apiUrl, {
                method: "GET",
                headers: { Accept: "application/json" },
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error(`Сервер ответил HTTP ${response.status}`);
            }

            const payload = await response.json();
            if (payload.mode !== "demo" || !Array.isArray(payload.vehicles)) {
                throw new Error("Ответ сервера не похож на ожидаемый JSON со списком точек");
            }

            const vehicles = payload.vehicles.filter(isValidVehicle);
            renderMarkers(vehicles);
            renderVehicleList(vehicles);
            setStatus(
                `Получено ${vehicles.length} демонстрационных меток. Это не фактическое положение транспорта.`,
                "success",
            );
        } catch (error) {
            console.error("Не удалось получить учебные точки:", error);
            setStatus(
                "Не удалось получить точки. Проверьте, запущен ли Django-сервер, и откройте Console/Network в инструментах браузера.",
                "error",
            );
        } finally {
            requestInProgress = false;
            refreshButton.disabled = false;
        }
    }

    refreshButton.addEventListener("click", loadDemoVehicles);
    loadDemoVehicles();

    // Обычный HTTP GET для учебного прототипа. Позднее интервал согласовать с сервером.
    window.setInterval(loadDemoVehicles, 5000);
})();
