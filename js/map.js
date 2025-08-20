class MapManager {
    constructor(mapId, initialCoords) {
        this.map = L.map(mapId).setView(initialCoords, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
        this.pointMarkers = new Map();
        this.startMarker = null;
        this.endMarker = null;
        this.routeLayers = [];
    }
    onMapClick(callback) { this.map.on('click', callback); }
    addPoint(point) {
        const marker = L.marker(point.location).addTo(this.map);
        marker.bindPopup(`<h3>${point.name}</h3><p>${point.phone || ''}</p>`);
        this.pointMarkers.set(point.id, marker);
        return marker;
    }
    removePoint(pointId) {
        if (this.pointMarkers.has(pointId)) {
            this.map.removeLayer(this.pointMarkers.get(pointId));
            this.pointMarkers.delete(pointId);
        }
    }
    toggleMarkerVisibility(pointId, isVisible) {
        const marker = this.pointMarkers.get(pointId);
        if (marker) {
            if (isVisible) this.map.addLayer(marker);
            else this.map.removeLayer(marker);
        }
    }
    setTerminal(type, location) {
        const iconHtml = type === 'start' ? '&#127979;' : '&#127988;';
        const popupText = type === 'start' ? 'Start Point' : 'End Point';
        const markerRef = type === 'start' ? 'startMarker' : 'endMarker';
        if (this[markerRef]) this.map.removeLayer(this[markerRef]);
        this[markerRef] = L.marker(location, {
            icon: L.divIcon({ className: 'terminal-marker', html: iconHtml })
        }).addTo(this.map).bindPopup(popupText);
    }
    drawRoutes(clusters, startLoc, endLoc) {
        this.clearRoutes();
        const busColors = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00'];
        clusters.forEach(async (cluster, index) => {
            if (cluster.points.length === 0) return;
            const waypoints = [startLoc, ...cluster.points, endLoc];
            const routeData = await this.getRoadRoute(waypoints);
            if (!routeData) return;
            const route = L.polyline(routeData.coords, { color: busColors[index % busColors.length], weight: 5 }).addTo(this.map);
            route.on('click', () => {
                uiManager.displayDirections(routeData, index);
            });
            this.routeLayers.push(route);
        });
    }
    clearRoutes() {
        this.routeLayers.forEach(layer => this.map.removeLayer(layer));
        this.routeLayers = [];
    }
    getVisiblePoints() {
        return Array.from(this.pointMarkers.values()).filter(marker => this.map.hasLayer(marker)).map(marker => marker.getLatLng());
    }
    async getRoadRoute(coordinates) {
        try {
            const coordString = coordinates.map(c => `${c.lng},${c.lat}`).join(';');
            const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson&steps=true&annotations=true`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.code !== 'Ok') throw new Error(data.message || 'Routing API error');
            const route = data.routes[0];
            return {
                coords: route.geometry.coordinates.map(c => [c[1], c[0]]),
                summary: { totalDistance: route.distance, totalTime: route.duration },
                steps: route.legs.flatMap(leg => leg.steps)
            };
        } catch (error) {
            uiManager.showError(error.message);
            return null;
        }
    }
    clearAll() {
        this.clearRoutes();
        this.pointMarkers.forEach(marker => this.map.removeLayer(marker));
        if(this.startMarker) this.map.removeLayer(this.startMarker);
        if(this.endMarker) this.map.removeLayer(this.endMarker);
    }
}