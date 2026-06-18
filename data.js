// Data structure for storing visited regions
class MapData {
    constructor() {
        this.visitedRegions = new Set(this.loadFromStorage());
        this.regionsMetadata = window.chinaCities || {};
    }

    addVisit(regionId, type = 'province') {
        this.visitedRegions.add(`${regionId}:${type}`);
        this.saveToStorage();
    }

    removeVisit(regionId, type = 'province') {
        this.visitedRegions.delete(`${regionId}:${type}`);
        this.saveToStorage();
    }

    toggleVisit(regionId, type = 'province') {
        const key = `${regionId}:${type}`;
        if (this.visitedRegions.has(key)) {
            this.visitedRegions.delete(key);
        } else {
            this.visitedRegions.add(key);
        }
        this.saveToStorage();
    }

    isVisited(regionId, type = 'province') {
        return this.visitedRegions.has(`${regionId}:${type}`);
    }

    getStats() {
        let provinces = 0, cities = 0, counties = 0;
        
        this.visitedRegions.forEach(item => {
            const [, type] = item.split(':');
            if (type === 'province') provinces++;
            else if (type === 'city') cities++;
            else if (type === 'county') counties++;
        });

        return { provinces, cities, counties };
    }

    getVisitedList() {
        const list = [];
        this.visitedRegions.forEach(item => {
            const [regionId, type] = item.split(':');
            list.push({ regionId, type, name: this.getRegionName(regionId) });
        });
        return list.sort((a, b) => a.name.localeCompare(b.name));
    }

    getRegionName(regionId) {
        if (this.regionsMetadata[regionId]) {
            return this.regionsMetadata[regionId].name;
        }
        return regionId;
    }

    saveToStorage() {
        localStorage.setItem('mapData', JSON.stringify(Array.from(this.visitedRegions)));
    }

    loadFromStorage() {
        const data = localStorage.getItem('mapData');
        return data ? JSON.parse(data) : [];
    }

    exportData() {
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            stats: this.getStats(),
            visitedRegions: this.getVisitedList()
        };
        return JSON.stringify(data, null, 2);
    }

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.visitedRegions && Array.isArray(data.visitedRegions)) {
                this.visitedRegions.clear();
                data.visitedRegions.forEach(item => {
                    this.visitedRegions.add(`${item.regionId}:${item.type}`);
                });
                this.saveToStorage();
                return true;
            }
        } catch (error) {
            console.error('Import failed:', error);
        }
        return false;
    }

    clearAll() {
        this.visitedRegions.clear();
        this.saveToStorage();
    }
}

// Global map data instance
let mapData;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    mapData = new MapData();
});
