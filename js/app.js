class App {
    constructor() {
        this.points = new Map();
        this.busCount = 2;
        this.startPoint = null;
        this.endPoint = null;
        this.eraseMode = false;
        this.currentState = 'idle'; // idle, setting-start, setting-end
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
        const point = {
            id: Date.now(),
            name,
            phone,
            location: this.pendingLocation
        };
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

    togglePointVisibility(pointId, isVisible) {
        this.mapManager.toggleMarkerVisibility(pointId, isVisible);
    }
    
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

    generateRoutes() {
        if (!this.startPoint || !this.endPoint) {
            this.uiManager.showError("Please set both start and end points first.");
            return;
        }

        const visiblePoints = this.mapManager.getVisiblePoints();
        const clusters = this.clusterPoints(visiblePoints, this.busCount);
        this.mapManager.drawRoutes(clusters, this.startPoint, this.endPoint);
    }

    clusterPoints(points, k) {
        if (points.length === 0) return [];
        // Sort points by latitude first, then longitude for simple geographic grouping
        const sortedPoints = [...points].sort((a, b) => a.lat - b.lat || a.lng - b.lng);
        
        const clusters = Array.from({ length: k }, () => ({ points: [] }));
        sortedPoints.forEach((point, i) => {
            clusters[i % k].points.push(point);
        });
        return clusters;
    }

    savePlan() {
        const plan = {
            start: this.startPoint,
            end: this.endPoint,
            busCount: this.busCount,
            points: Array.from(this.points.values())
        };
        localStorage.setItem('busRoutePlan', JSON.stringify(plan));
        alert("Plan saved successfully!");
    }

    loadPlan() {
        const savedPlan = localStorage.getItem('busRoutePlan');
        if (!savedPlan) {
            alert("No saved plan found.");
            return;
        }

        // Clear current state
        this.uiManager.clearAll();
        this.mapManager.clearAll();
        this.points.clear();
        
        const plan = JSON.parse(savedPlan);
        
        // Load new state
        this.startPoint = plan.start;
        this.endPoint = plan.end;
        this.busCount = plan.busCount;
        this.uiManager.updateBusCount(this.busCount);
        
        if (this.startPoint) this.mapManager.setTerminal('start', this.startPoint);
        if (this.endPoint) this.mapManager.setTerminal('end', this.endPoint);
        
        plan.points.forEach(point => this.loadPoint(point));
        
        alert("Plan loaded successfully!");
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

// Initialize the application when the DOM is ready
const app = new App();
document.addEventListener('DOMContentLoaded', () => app.init());