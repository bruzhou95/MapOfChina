// Main map application
class ChinaMap {
    constructor() {
        console.log('ChinaMap constructor called');
        this.mapContainer = document.getElementById('mapSvgContainer');
        console.log('mapContainer found:', this.mapContainer ? 'YES' : 'NO');
        this.currentZoom = 1;
        this.svgLoaded = false;
        this.regionsIndex = {};
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.init();
    }

    async init() {
        console.log('ChinaMap init() called');
        this.setupEventListeners();
        console.log('Event listeners setup done');
        
        // Restore sidebar state
        const sidebarHidden = localStorage.getItem('sidebarHidden') === 'true';
        if (sidebarHidden) {
            document.querySelector('.content').classList.add('sidebar-hidden');
        }
        
        await this.loadMap();
        console.log('loadMap() completed');
        this.updateUI();
        console.log('UI updated');
    }

    setupEventListeners() {
        // Control buttons
        document.getElementById('resetZoomBtn').addEventListener('click', () => this.resetZoom());
        document.getElementById('toggleSidebarBtn').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));

        // Filters
        document.getElementById('filterProvince').addEventListener('change', () => this.updateMapView());
        document.getElementById('filterCity').addEventListener('change', () => this.updateMapView());
        document.getElementById('filterCounty').addEventListener('change', () => this.updateMapView());

        // Drag to pan when zoomed
        this.mapContainer.addEventListener('mousedown', (e) => this.startPan(e));
        this.mapContainer.addEventListener('mousemove', (e) => this.pan(e));
        this.mapContainer.addEventListener('mouseup', () => this.endPan());
        this.mapContainer.addEventListener('mouseleave', () => this.endPan());
    }

    setupZoomListener() {
        // Attach wheel listener after SVG is loaded
        this.mapContainer.addEventListener('wheel', (e) => this.handleZoom(e), { passive: false });
    }

    fitMapToContainer() {
        const svg = this.mapContainer.querySelector('svg');
        if (!svg) return;

        // Get container dimensions
        const containerWidth = this.mapContainer.clientWidth;
        const containerHeight = this.mapContainer.clientHeight;

        // Use SVG's width/height attributes
        const svgWidth = 1801;  // From SVG width attribute
        const svgHeight = 1924.75;  // From SVG height attribute

        console.log('Container:', containerWidth, 'x', containerHeight);
        console.log('SVG:', svgWidth, 'x', svgHeight);

        // Calculate what zoom is needed to fit, then increase it for better visibility
        const maxZoomX = containerWidth / svgWidth;
        const maxZoomY = containerHeight / svgHeight;
        const fitZoom = Math.min(maxZoomX, maxZoomY) * 1.5; // Reduced to 1.0 for smaller map on load

        // Calculate offsets
        const scaledWidth = svgWidth * fitZoom;
        const scaledHeight = svgHeight * fitZoom;
        
        // Center horizontally, offset vertically to show top part of map (northwest China)
        const offsetX = (containerWidth - scaledWidth) / 2 + 150; // Add 150px to shift right
        const offsetY = 550; // Offset to show top part of map

        this.currentZoom = fitZoom;
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        console.log('Calculated Zoom:', fitZoom, 'Offset:', offsetX, offsetY);

        svg.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.currentZoom})`;
        svg.style.transformOrigin = 'top left';
        svg.style.transition = 'transform 0.3s ease-out';
    }

    handleZoom(event) {
        event.preventDefault();
        
        // Determine zoom direction
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1; // Scroll down = zoom out, scroll up = zoom in
        this.currentZoom *= zoomFactor;
        
        // Limit zoom levels (0.5x to 3x)
        this.currentZoom = Math.max(0.5, Math.min(3, this.currentZoom));
        
        // Apply zoom to SVG with offset
        const svg = this.mapContainer.querySelector('svg');
        if (svg) {
            svg.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.currentZoom})`;
            svg.style.transformOrigin = 'top left';
            svg.style.transition = 'transform 0.1s ease-out';
        }
    }

    resetZoom() {
        this.currentZoom = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        const svg = this.mapContainer.querySelector('svg');
        if (svg) {
            svg.style.transform = 'translate(0, 0) scale(1)';
            svg.style.transition = 'transform 0.3s ease-out';
        }
    }

    startPan(event) {
        if (event.button !== 0) return; // Only left mouse button
        
        this.isPanning = true;
        this.panStartX = event.clientX;
        this.panStartY = event.clientY;
    }

    pan(event) {
        if (!this.isPanning) return;
        
        const deltaX = event.clientX - this.panStartX;
        const deltaY = event.clientY - this.panStartY;
        
        // Update offset - works at any zoom level
        this.offsetX += deltaX;
        this.offsetY += deltaY;
        
        // Update pan start position for next move
        this.panStartX = event.clientX;
        this.panStartY = event.clientY;
        
        // Apply transform
        const svg = this.mapContainer.querySelector('svg');
        if (svg) {
            svg.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.currentZoom})`;
            svg.style.transition = 'none';
        }
    }

    endPan() {
        this.isPanning = false;
    }

    toggleSidebar() {
        const content = document.querySelector('.content');
        content.classList.toggle('sidebar-hidden');
        
        // Save preference to localStorage
        const isHidden = content.classList.contains('sidebar-hidden');
        localStorage.setItem('sidebarHidden', isHidden);
        console.log('Sidebar toggled, hidden:', isHidden);
    }

    async loadMap() {
        try {
            console.log('Starting to load SVG from: china-map.svg');
            const response = await fetch('china-map.svg');
            console.log('Fetch response status:', response.status, response.statusText);
            
            if (response.ok) {
                const svgText = await response.text();
                console.log('SVG text length:', svgText.length);
                console.log('SVG first 200 chars:', svgText.substring(0, 200));
                
                if (!svgText || svgText.length === 0) {
                    console.error('SVG file is empty!');
                    this.createPlaceholderMap();
                    return;
                }
                
                this.mapContainer.innerHTML = svgText;
                this.svgLoaded = true;
                console.log('SVG injected into container');
                this.setupZoomListener();
                this.fitMapToContainer();
                this.setupMapInteractions();
            } else {
                console.error('Failed to load SVG, status:', response.status);
                this.createPlaceholderMap();
            }
        } catch (error) {
            console.error('Failed to load map:', error);
            this.createPlaceholderMap();
        }
    }

    createPlaceholderMap() {
        // Create a placeholder map - will be replaced by actual SVG
        this.mapContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h3>地图还未加载</h3>
                <p>请将您的 Illustrator 文件导出为 SVG 格式，并命名为 <code>china-map.svg</code></p>
                <p style="font-size: 12px; margin-top: 20px; color: #999;">
                    导出步骤：<br>
                    1. 在 Adobe Illustrator 中打开 中国一级至三级行政区划地图.ai<br>
                    2. 点击 文件 → 导出为 → 选择 SVG 格式<br>
                    3. 将文件保存为 china-map.svg 在此文件夹中
                </p>
            </div>
        `;
    }

    setupMapInteractions() {
        const svg = this.mapContainer.querySelector('svg');
        if (!svg) return;

        // Find all path elements that represent regions
        const paths = svg.querySelectorAll('path[id], path[data-id], path[data-name]');
        
        if (paths.length === 0) {
            console.warn('No clickable paths found in SVG. Please ensure regions have id or data-id attributes.');
            return;
        }

        paths.forEach((path) => {
            const regionId = path.getAttribute('id') || 
                           path.getAttribute('data-id') || 
                           path.getAttribute('data-name');
            
            if (regionId) {
                path.style.cursor = 'pointer';
                path.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleRegionClick(regionId, path);
                });
                path.addEventListener('mouseenter', () => {
                    this.showRegionInfo(regionId, path);
                });

                this.regionsIndex[regionId] = path;

                // Update visual state if already visited
                if (mapData.isVisited(regionId)) {
                    this.markRegionVisited(path);
                }
            }
        });
    }

    handleRegionClick(regionId, pathElement) {
        mapData.toggleVisit(regionId);
        
        if (mapData.isVisited(regionId)) {
            this.markRegionVisited(pathElement);
        } else {
            this.markRegionUnvisited(pathElement);
        }

        this.updateUI();
    }

    markRegionVisited(pathElement) {
        pathElement.classList.add('visited');
        pathElement.classList.remove('visited-partial');
    }

    markRegionUnvisited(pathElement) {
        pathElement.classList.remove('visited');
        pathElement.classList.remove('visited-partial');
    }

    showRegionInfo(regionId, pathElement) {
        const regionName = mapData.getRegionName(regionId);
        const isVisited = mapData.isVisited(regionId);
        
        const detailsContent = document.getElementById('detailsContent');
        detailsContent.innerHTML = `
            <div>
                <p><strong>地区：</strong> ${regionName}</p>
                <p><strong>状态：</strong> ${isVisited ? '✓ 已访问' : '未访问'}</p>
                <p style="font-size: 12px; color: #999; margin-top: 10px;">
                    点击以${isVisited ? '取消' : '标记'}访问
                </p>
            </div>
        `;
    }

    updateMapView() {
        const showProvince = document.getElementById('filterProvince').checked;
        const showCity = document.getElementById('filterCity').checked;
        const showCounty = document.getElementById('filterCounty').checked;

        Object.entries(this.regionsIndex).forEach(([regionId, pathElement]) => {
            let show = false;
            if (regionId.includes('_province') && showProvince) show = true;
            if (regionId.includes('_city') && showCity) show = true;
            if (regionId.includes('_county') && showCounty) show = true;
            
            pathElement.style.display = show ? 'auto' : 'none';
        });
    }

    updateUI() {
        // Update statistics
        const stats = mapData.getStats();
        document.getElementById('provinceCount').textContent = stats.provinces;
        document.getElementById('cityCount').textContent = stats.cities;
        document.getElementById('countyCount').textContent = stats.counties;

        // Update visited list
        this.updateVisitedList();
    }

    updateVisitedList() {
        const visitedList = mapData.getVisitedList();
        const listContent = document.getElementById('visitedListContent');

        if (visitedList.length === 0) {
            listContent.innerHTML = '<p>暂无记录</p>';
            return;
        }

        let html = '';
        visitedList.forEach(item => {
            const typeDisplay = {
                'province': '省份',
                'city': '城市',
                'county': '县级'
            }[item.type] || item.type;

            html += `
                <div class="visit-item" data-region-id="${item.regionId}">
                    <div class="visit-item-name">${item.name}</div>
                    <div class="visit-item-type">${typeDisplay}</div>
                </div>
            `;
        });

        listContent.innerHTML = html;

        // Add click listeners to visited items
        listContent.querySelectorAll('.visit-item').forEach(item => {
            item.addEventListener('click', () => {
                const regionId = item.getAttribute('data-region-id');
                const pathElement = this.regionsIndex[regionId];
                if (pathElement) {
                    pathElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    pathElement.style.animation = 'pulse 0.6s ease-in-out';
                }
            });
        });
    }

    clearAll() {
        if (confirm('确定要清除所有记录吗？此操作无法撤销。')) {
            mapData.clearAll();
            
            // Reset visual state
            Object.values(this.regionsIndex).forEach(path => {
                this.markRegionUnvisited(path);
            });

            this.updateUI();
        }
    }

    exportData() {
        const jsonData = mapData.exportData();
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `china-map-record-${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importData(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result;
            if (typeof content === 'string' && mapData.importData(content)) {
                // Reset visual states
                Object.values(this.regionsIndex).forEach(path => {
                    this.markRegionUnvisited(path);
                });

                // Update visual states for imported data
                mapData.visitedRegions.forEach(item => {
                    const [regionId] = item.split(':');
                    const pathElement = this.regionsIndex[regionId];
                    if (pathElement) {
                        this.markRegionVisited(pathElement);
                    }
                });

                this.updateUI();
                alert('数据导入成功！');
            } else {
                alert('导入失败，请检查文件格式。');
            }
        };
        reader.readAsText(file);

        // Reset input
        event.target.value = '';
    }
}

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
`;
document.head.appendChild(style);

// Initialize map when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.mapData) {
            window.chinaMap = new ChinaMap();
        }
    }, 100);
});
