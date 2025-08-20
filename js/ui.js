class UIManager {
    constructor() {
        this.pointModal = document.getElementById('point-modal');
        this.pointForm = document.getElementById('point-form');
        this.cancelPointBtn = document.getElementById('cancel-point-btn');
        this.markedPointsList = document.getElementById('marked-points-list');
        this.busCountDisplay = document.getElementById('bus-count-display');
        this.directionsPanel = document.getElementById('directions-panel');
        this.appContainer = document.getElementById('app-container');
    }
    bindApp(app) {
        this.app = app;
        this.pointForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('point-name').value;
            const phone = document.getElementById('point-phone').value;
            this.app.savePoint(name, phone);
        });
        this.cancelPointBtn.addEventListener('click', () => this.hidePointModal());
    }
    showPointModal() {
        this.pointForm.reset();
        this.pointModal.style.display = 'flex';
        document.getElementById('point-name').focus();
    }
    hidePointModal() { this.pointModal.style.display = 'none'; }
    addPointToSidebar(point) {
        const listItem = document.createElement('li');
        listItem.id = `point-li-${point.id}`;
        listItem.className = 'list-item';
        listItem.innerHTML = `<div><strong>${point.name}</strong><br><small>${point.phone || ''}</small></div><label class="switch"><input type="checkbox" checked onchange="app.togglePointVisibility(${point.id}, this.checked)"><span class="slider"></span></label>`;
        this.markedPointsList.appendChild(listItem);
    }
    removePointFromSidebar(pointId) {
        const listItem = document.getElementById(`point-li-${pointId}`);
        if (listItem) listItem.remove();
    }
    updateBusCount(count) { this.busCountDisplay.textContent = count; }
    displayDirections(routeData, busIndex) {
        const distanceInKm = (routeData.summary.totalDistance / 1000).toFixed(2);
        const timeInMinutes = Math.round(routeData.summary.totalTime / 60);
        let html = `<h2><i class="fas fa-directions"></i> Route for Bus ${busIndex + 1}</h2>`;
        html += `<div class="directions-summary">Distance: ${distanceInKm} km | ETA: ~${timeInMinutes} mins</div>`;
        html += '<ol class="directions-list">';
        routeData.steps.forEach(step => { html += `<li>${step.maneuver.instruction}</li>`; });
        html += '</ol>';
        this.directionsPanel.innerHTML = html;
    }
    clearDirections() { this.directionsPanel.innerHTML = `<p class="placeholder-text">Click a generated route on the map to see directions here.</p>`; }
    setAppMode(mode) {
        this.appContainer.className = '';
        if(mode) this.appContainer.classList.add(mode);
    }
    showError(message) { alert(`Error: ${message}`); }
    clearAll() {
        this.markedPointsList.innerHTML = '';
        this.clearDirections();
    }
}