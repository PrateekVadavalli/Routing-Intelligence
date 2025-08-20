class App {
    constructor() {
        this.points = new Map();
        this.busCount = 2;
        this.startPoint = null;
        this.endPoint = null;
        this.eraseMode = false;
        this.currentState = 'idle';
        this.pendingLocation = null;
    }
    
    init() {
        this.mapManager = new MapManager('map', [17.385, 78.486]);
        this.uiManager = new UIManager();
        this.uiManager.bindApp(this);
        this.attachEventListeners();
    }

    attachEventListeners() {
        document.getElementById('set-start-btn').addEventListener('click', () => this.setMode('setting-start'));
        document.getElementById('set-end-btn').addEventListener('click', () => this.setMode('setting-end'));
        document.getElementById('generate-routes-btn').addEventListener('click', () => this.generateRoutes());
        document.getElementById('erase-mode-btn').addEventListener('click', () => this.toggleEraseMode());
        document.getElementById('increment-bus-btn').addEventListener('click', () => this.changeBusCount(1));
        document.getElementById('decrement-bus-btn').addEventListener('click', () => this.changeBusCount(-1));
        document.getElementById('save-plan-btn').addEventListener('click', () => this.savePlan());
        document.getElementById('load-plan-btn').addEventListener('click', () => this.loadPlan());
        this.mapManager.onMapClick((e) => this.handleMapClick(e.latlng));
    }

    setMode(mode) {
        this.currentState = mode;
        this.uiManager.setAppMode(mode);
    }

    handleMapClick(location) {
        switch (this.currentState) {
            case 'setting-start':
                this.startPoint = location;
                this.mapManager.setTerminal('start', location);
                this.setMode('idle');
                break;
            case 'setting-end':
                this.endPoint = location;
                this.mapManager.setTerminal('end', location);
                this.setMode('idle');
                break;
            default:
                if(this.eraseMode) return;
                this.pendingLocation = location;
                this.uiManager.showPointModal();
                break;
        }
    }

    savePoint(name, phone) {
        const point = { id: Date.now(), name, phone, location: this.pendingLocation };
        this.points.set(point.id, point);
        const marker = this.mapManager.addPoint(point);
        marker.on('click', () => {
            if(this.eraseMode) {
                this.mapManager.removePoint(point.id);
                this.uiManager.removePointFromSidebar(point.id);
                this.points.delete(point.id);
            }
        });
        this.uiManager.addPointToSidebar(point);
        this.uiManager.hidePointModal();
    }

    togglePointVisibility(pointId, isVisible) { this.mapManager.toggleMarkerVisibility(pointId, isVisible); }
    
    changeBusCount(amount) {
        const newCount = this.busCount + amount;
        if (newCount >= 1 && newCount <= 8) {
            this.busCount = newCount;
            this.uiManager.updateBusCount(this.busCount);
        }
    }
    
    toggleEraseMode() {
        this.eraseMode = !this.eraseMode;
        document.getElementById('erase-mode-btn').classList.toggle('active', this.eraseMode);
    }

    async generateRoutes() {
        if (!this.startPoint || !this.endPoint) {
            this.uiManager.showError("Please set both start and end points first.");
            return;
        }
        
        this.uiManager.showLoading("Generating initial routes...");
        const visiblePoints = this.mapManager.getVisiblePoints();
        if (visiblePoints.length === 0) {
            this.uiManager.showError("Please mark at least one point.");
            this.uiManager.hideLoading();
            return;
        }

        // 1. Create the initial "greedy" routes
        let clusters = this.clusterPoints(visiblePoints, this.busCount);

        // 2. Optimize these routes with 2-Opt Swap
        this.uiManager.showLoading("Optimizing routes...");
        clusters = await this.optimizeClustersWith2Opt(clusters);

        // 3. Draw the final, optimized routes
        this.uiManager.showLoading("Drawing final routes...");
        await this.mapManager.drawRoutes(clusters, this.startPoint, this.endPoint);
        this.uiManager.hideLoading();
    }
    
    clusterPoints(points, k) {
        if (points.length === 0) return [];
        const sortedPoints = [...points].sort((a, b) => a.lat - b.lat || a.lng - b.lng);
        const clusters = Array.from({ length: k }, () => ({ points: [] }));
        sortedPoints.forEach((point, i) => {
            clusters[i % k].points.push(point);
        });
        return clusters;
    }

    async optimizeClustersWith2Opt(initialClusters) {
        let bestClusters = JSON.parse(JSON.stringify(initialClusters));
        let bestDistance = await this.calculateTotalDistance(bestClusters);
        let improvementFound = true;
        const MAX_ITERATIONS = 100;
        let currentIteration = 0;

        while (improvementFound && currentIteration < MAX_ITERATIONS) {
            improvementFound = false;
            currentIteration++;
            for (let i = 0; i < bestClusters.length; i++) {
                for (let j = i + 1; j < bestClusters.length; j++) {
                    for (let p1_index = 0; p1_index < bestClusters[i].points.length; p1_index++) {
                        for (let p2_index = 0; p2_index < bestClusters[j].points.length; p2_index++) {
                            const newClusters = JSON.parse(JSON.stringify(bestClusters));
                            const point1 = newClusters[i].points[p1_index];
                            const point2 = newClusters[j].points[p2_index];
                            newClusters[i].points[p1_index] = point2;
                            newClusters[j].points[p2_index] = point1;
                            const newDistance = await this.calculateTotalDistance(newClusters);
                            if (newDistance < bestDistance) {
                                bestDistance = newDistance;
                                bestClusters = newClusters;
                                improvementFound = true;
                            }
                        }
                    }
                }
            }
        }
        return bestClusters;
    }

    async calculateTotalDistance(clusters) {
        let totalDistance = 0;
        for (const cluster of clusters) {
            if (cluster.points.length > 0) {
                const waypoints = [this.startPoint, ...cluster.points, this.endPoint];
                const distance = await this.mapManager.getRouteDistance(waypoints);
                totalDistance += distance;
            }
        }
        return totalDistance;
    }

    savePlan() {
        const plan = {
            start: this.startPoint, end: this.endPoint, busCount: this.busCount,
            points: Array.from(this.points.values())
        };
        localStorage.setItem('busRoutePlan', JSON.stringify(plan));
        alert("Plan saved!");
    }

    loadPlan() {
        const savedPlan = localStorage.getItem('busRoutePlan');
        if (!savedPlan) { alert("No saved plan found."); return; }
        this.uiManager.clearAll();
        this.mapManager.clearAll();
        this.points.clear();
        const plan = JSON.parse(savedPlan);
        this.startPoint = plan.start;
        this.endPoint = plan.end;
        this.busCount = plan.busCount;
        this.uiManager.updateBusCount(this.busCount);
        if (this.startPoint) this.mapManager.setTerminal('start', this.startPoint);
        if (this.endPoint) this.mapManager.setTerminal('end', this.endPoint);
        plan.points.forEach(point => this.loadPoint(point));
        alert("Plan loaded!");
    }
    
    loadPoint(point) {
        this.points.set(point.id, point);
        const marker = this.mapManager.addPoint(point);
        marker.on('click', () => {
            if(this.eraseMode) {
                this.mapManager.removePoint(point.id);
                this.uiManager.removePointFromSidebar(point.id);
                this.points.delete(point.id);
            }
        });
        this.uiManager.addPointToSidebar(point);
    }
}

const app = new App();
document.addEventListener('DOMContentLoaded', () => app.init());