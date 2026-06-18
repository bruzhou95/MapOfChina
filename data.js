// Data structure for storing visited regions
class MapData {
    constructor() {
        this.visitedRegions = new Set(this.loadFromStorage());
        this.regionsMetadata = window.chinaCities || {};
        this.buildHierarchyIndex();
        this.ready = this.loadCsvHierarchy();
    }

    addVisit(regionId, type = 'province') {
        this.visitedRegions.add(`${regionId}:${type}`);
        this.saveToStorage();
    }

    removeVisit(regionId, type = 'province') {
        this.visitedRegions.delete(`${regionId}:${type}`);
        this.saveToStorage();
    }

    parseCsvLine(line) {
        const fields = [];
        let cur = '', inQ = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') { inQ = !inQ; }
            else if (c === ',' && !inQ) { fields.push(cur.trim()); cur = ''; }
            else { cur += c; }
        }
        fields.push(cur.trim());
        return fields;
    }

    async loadCsvHierarchy() {
        try {
            // Load 基础列表.csv — 3-column numeric-code format matching SVG path IDs
            // Columns: level3 (province code), level2 (city code), level1 (county code)
            // Empty cells inherit the value from the previous row (continuation format)
            const response = await fetch('基础列表.csv');
            if (!response.ok) {
                console.warn('基础列表.csv not found — hierarchy will rely on SVG data-parent attributes');
                return;
            }
            const text = await response.text();
            const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
                              .split('\n').slice(1)   // skip header row
                              .filter(l => l.trim());

            // Reset and rebuild from complete CSV data
            this.countyToCity = {};
            this.cityCounties = {};
            this.cityToProvince = {};
            this.provinceCities = {};

            let curProv = '', curCity = '';
            lines.forEach(line => {
                const cols = line.split(',').map(c => c.trim());
                const l3 = cols[0]; // province code
                const l2 = cols[1]; // city code
                const l1 = cols[2]; // county code

                if (l3) curProv = l3;
                if (l2) curCity = l2;

                if (curProv && curCity) {
                    const provId = `${curProv}-3`;
                    const cityId = `${curCity}-2`;
                    this.cityToProvince[cityId] = provId;
                    if (!this.provinceCities[provId]) this.provinceCities[provId] = [];
                    if (!this.provinceCities[provId].includes(cityId))
                        this.provinceCities[provId].push(cityId);

                    if (l1) {
                        this.countyToCity[l1] = cityId;
                        if (!this.cityCounties[cityId]) this.cityCounties[cityId] = [];
                        this.cityCounties[cityId].push(l1);
                    }
                }
            });
            console.log(`Hierarchy loaded from 基础列表.csv: ${Object.keys(this.countyToCity).length} counties, ${Object.keys(this.cityToProvince).length} cities`);
        } catch (e) {
            console.warn('CSV hierarchy load failed:', e);
        }
    }

    getBaseId(regionId) {
        return regionId.replace(/-[23]$/, '');
    }

    buildHierarchyIndex() {
        this.countyToCity = {};   // countyId → cityId (cityName + "-2")
        this.cityCounties = {};   // cityId → [countyId, ...]
        this.cityToProvince = {}; // cityId → provId (provName + "-3")
        this.provinceCities = {}; // provId → [cityId, ...]

        Object.keys(this.regionsMetadata).forEach(provName => {
            const prov = this.regionsMetadata[provName];
            if (prov.type !== 'province') return;
            const provId = `${provName}-3`;
            this.provinceCities[provId] = [];

            Object.keys(prov.cities || {}).forEach(cityName => {
                const city = prov.cities[cityName];
                const cityId = `${cityName}-2`;
                this.provinceCities[provId].push(cityId);
                this.cityToProvince[cityId] = provId;
                this.cityCounties[cityId] = (city.counties || []).map(c => c.id);
                this.cityCounties[cityId].forEach(countyId => {
                    this.countyToCity[countyId] = cityId;
                });
            });
        });
    }

    getParentId(regionId) {
        const gov = this.getGovernanceLevel(regionId);
        if (gov === 1) return this.countyToCity[regionId] || null;
        if (gov === 2) return this.cityToProvince[regionId] || null;
        return null;
    }

    getChildren(parentId) {
        const gov = this.getGovernanceLevel(parentId);
        if (gov === 2) return this.cityCounties[parentId] || [];
        if (gov === 3) return this.provinceCities[parentId] || [];
        return [];
    }

    areAllChildrenVisited(parentId) {
        const children = this.getChildren(parentId);
        return children.length > 0 && children.every(id => this.isVisited(id));
    }

    hasAnyChildVisited(parentId) {
        const children = this.getChildren(parentId);
        return children.some(id => this.isVisited(id));
    }

    getGovernanceLevel(regionId) {
        if (regionId.endsWith('-3')) return 3; // 省
        if (regionId.endsWith('-2')) return 2; // 市
        return 1;                               // 县
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
            const [regionId] = item.split(':');
            const gov = this.getGovernanceLevel(regionId);
            if (gov === 3) provinces++;
            else if (gov === 2) cities++;
            else counties++;
        });
        return { provinces, cities, counties };
    }

    getVisitedList() {
        const list = [];
        this.visitedRegions.forEach(item => {
            const [regionId, type] = item.split(':');
            const baseId = this.getBaseId(regionId);
            const govLevel = this.getGovernanceLevel(regionId);
            list.push({ regionId, baseId, type, name: this.getRegionName(regionId), govLevel });
        });
        return list.sort((a, b) => a.name.localeCompare(b.name));
    }

    getRegionName(regionId) {
        const baseId = this.getBaseId(regionId);
        if (this.regionsMetadata[baseId]) {
            return this.regionsMetadata[baseId].name;
        }
        return baseId;
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

// Global map data instance - initialize immediately (no DOM dependency)
const mapData = new MapData();
