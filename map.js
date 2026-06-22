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

        await mapData.ready;
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

        // Search
        const searchInput = document.getElementById('regionSearchInput');
        searchInput.addEventListener('input', () => this.handleSearch(searchInput.value));
        searchInput.addEventListener('keydown', (e) => { if (e.key === 'Escape') { searchInput.value = ''; this.handleSearch(''); } });

        // Unvisited filter buttons
        document.querySelectorAll('.uv-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.uv-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateUnvisitedList();
            });
        });

        // Toggle unvisited panel
        const toggleUnvisited = document.getElementById('toggleUnvisitedBtn');
        if (toggleUnvisited) {
            const content = document.querySelector('.content');
            const isHidden = localStorage.getItem('unvisitedHidden') === 'true';
            if (isHidden) content.classList.add('unvisited-hidden');
            toggleUnvisited.addEventListener('click', () => {
                content.classList.toggle('unvisited-hidden');
                localStorage.setItem('unvisitedHidden', content.classList.contains('unvisited-hidden'));
            });
        }

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
        const offsetY = 20; // Offset to show top part of map

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
        
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        const prevZoom = this.currentZoom;
        this.currentZoom = Math.max(0.5, Math.min(3, this.currentZoom * zoomFactor));

        // Keep the point under the cursor stationary while zooming
        const rect = this.mapContainer.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const zoomRatio = this.currentZoom / prevZoom;
        this.offsetX = mouseX - zoomRatio * (mouseX - this.offsetX);
        this.offsetY = mouseY - zoomRatio * (mouseY - this.offsetY);
        this.clampOffset();

        const svg = this.mapContainer.querySelector('svg');
        if (svg) {
            svg.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.currentZoom})`;
            svg.style.transformOrigin = 'top left';
            svg.style.transition = 'transform 0.1s ease-out';
        }
    }

    clampOffset() {
        const svg = this.mapContainer.querySelector('svg');
        if (!svg) return;
        const svgW = parseFloat(svg.getAttribute('width'))  || 1801;
        const svgH = parseFloat(svg.getAttribute('height')) || 1924.75;
        const scaledW = svgW * this.currentZoom;
        const scaledH = svgH * this.currentZoom;
        const cW = this.mapContainer.clientWidth;
        const cH = this.mapContainer.clientHeight;
        const margin = 120; // minimum visible pixels of map that must stay on screen
        this.offsetX = Math.max(margin - scaledW, Math.min(cW - margin, this.offsetX));
        this.offsetY = Math.max(margin - scaledH, Math.min(cH - margin, this.offsetY));
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
            this.clampOffset();
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
                this.reorderSvgLayers();
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

    reorderSvgLayers() {
        const svg = this.mapContainer.querySelector('svg');
        if (!svg) return;

        // Collect region paths and group by immediate parent
        const groupMap = new Map(); // parent element → [paths]
        svg.querySelectorAll('path[id], path[data-id], path[data-name]').forEach(path => {
            const id = path.getAttribute('id') || path.getAttribute('data-id') || path.getAttribute('data-name');
            if (!id) return;
            const parent = path.parentElement;
            if (!groupMap.has(parent)) groupMap.set(parent, []);
            groupMap.get(parent).push(path);
        });

        // Within each parent: county (1) first/bottom, province (3) last/top (visible overlay)
        groupMap.forEach((paths, parent) => {
            paths.sort((a, b) => {
                const idA = a.getAttribute('id') || a.getAttribute('data-id') || '';
                const idB = b.getAttribute('id') || b.getAttribute('data-id') || '';
                return mapData.getGovernanceLevel(idA) - mapData.getGovernanceLevel(idB);
            });
            paths.forEach(p => parent.appendChild(p));
        });

        // Re-order groups: county-group first/bottom, province-group last/top
        const parents = Array.from(groupMap.keys());
        if (parents.length > 1) {
            const commonParent = parents[0].parentElement;
            if (commonParent && parents.every(p => p.parentElement === commonParent)) {
                parents.sort((a, b) => {
                    const minGovA = Math.min(...groupMap.get(a).map(p => mapData.getGovernanceLevel(p.getAttribute('id') || p.getAttribute('data-id') || '')));
                    const minGovB = Math.min(...groupMap.get(b).map(p => mapData.getGovernanceLevel(p.getAttribute('id') || p.getAttribute('data-id') || '')));
                    return minGovA - minGovB; // county group first, province group last (on top)
                });
                parents.forEach(g => commonParent.appendChild(g));
            }
        }
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
                const govLevel = mapData.getGovernanceLevel(regionId);
                const isClickable = govLevel === 1;

                if (isClickable) {
                    path.style.cursor = 'pointer';
                    path.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.handleRegionClick(regionId, path);
                    });
                } else {
                    path.style.cursor = 'default';
                    path.style.pointerEvents = 'none';
                }

                path.addEventListener('mouseenter', () => {
                    this.showRegionInfo(regionId, path);
                });

                // Store ALL paths per ID (SVG often has duplicate IDs for fill + border layers)
                if (!this.regionsIndex[regionId]) this.regionsIndex[regionId] = [];
                if (path) this.regionsIndex[regionId].push(path);

                // Restore visual state if already visited
                if (mapData.isVisited(regionId)) {
                    this.updateRegionVisual(path, mapData.getGovernanceLevel(regionId));
                }
            }
        });

        this.buildSvgHierarchyFallback();
    }

    buildSvgHierarchyFallback() {
        // 1) Best source: <metadata id="hierarchy"> JSON embedded by the SVG editor
        const metaEl = this.mapContainer.querySelector('metadata#hierarchy');
        if (metaEl && metaEl.textContent.trim()) {
            try {
                const { countyToCity, cityToProvince } = JSON.parse(metaEl.textContent);
                // Merge into mapData hierarchy maps
                Object.assign(mapData.countyToCity, countyToCity);
                Object.assign(mapData.cityToProvince, cityToProvince);
                // Rebuild reverse maps from the imported data
                Object.entries(countyToCity).forEach(([county, city]) => {
                    if (!mapData.cityCounties[city]) mapData.cityCounties[city] = [];
                    if (!mapData.cityCounties[city].includes(county))
                        mapData.cityCounties[city].push(county);
                });
                Object.entries(cityToProvince).forEach(([city, prov]) => {
                    if (!mapData.provinceCities[prov]) mapData.provinceCities[prov] = [];
                    if (!mapData.provinceCities[prov].includes(city))
                        mapData.provinceCities[prov].push(city);
                });
                console.log(`Hierarchy loaded from SVG metadata: ${Object.keys(countyToCity).length} counties, ${Object.keys(cityToProvince).length} cities`);
                return;
            } catch (e) {
                console.warn('SVG metadata hierarchy parse failed, trying data-parent attributes:', e);
            }
        }

        // 2) Second-best: data-parent attributes set by the SVG editor
        const pathsWithParent = this.mapContainer.querySelectorAll('[data-parent]');
        if (pathsWithParent.length > 0) {
            pathsWithParent.forEach(el => {
                const regionId = el.getAttribute('id');
                const parentId = el.getAttribute('data-parent');
                if (!regionId || !parentId) return;
                const level = mapData.getGovernanceLevel(regionId);
                if (level === 1) {
                    mapData.countyToCity[regionId] = parentId;
                    if (!mapData.cityCounties[parentId]) mapData.cityCounties[parentId] = [];
                    if (!mapData.cityCounties[parentId].includes(regionId))
                        mapData.cityCounties[parentId].push(regionId);
                } else if (level === 2) {
                    mapData.cityToProvince[regionId] = parentId;
                    if (!mapData.provinceCities[parentId]) mapData.provinceCities[parentId] = [];
                    if (!mapData.provinceCities[parentId].includes(regionId))
                        mapData.provinceCities[parentId].push(regionId);
                }
            });
            console.log(`Hierarchy loaded from SVG data-parent attributes: ${pathsWithParent.length} paths`);
            return;
        }

        // 3) Fallback: infer from SVG group structure
        const pathsByParent = new Map();
        Object.entries(this.regionsIndex).forEach(([id, paths]) => {
            const el = Array.isArray(paths) ? paths[0] : paths;
            if (!el) return;
            const parent = el.parentElement;
            if (!pathsByParent.has(parent)) pathsByParent.set(parent, []);
            pathsByParent.get(parent).push(id);
        });

        pathsByParent.forEach(ids => {
            const provIds  = ids.filter(id => mapData.getGovernanceLevel(id) === 3);
            const cityIds  = ids.filter(id => mapData.getGovernanceLevel(id) === 2);
            const countyIds = ids.filter(id => mapData.getGovernanceLevel(id) === 1);

            // Map unparented counties to the single city in the same group
            if (cityIds.length === 1) {
                const cityId = cityIds[0];
                countyIds.forEach(countyId => {
                    if (mapData.getParentId(countyId)) return;
                    mapData.countyToCity[countyId] = cityId;
                    if (!mapData.cityCounties[cityId]) mapData.cityCounties[cityId] = [];
                    if (!mapData.cityCounties[cityId].includes(countyId))
                        mapData.cityCounties[cityId].push(countyId);
                });
            }

            // Map unparented cities to the single province in the same group
            if (provIds.length === 1) {
                const provId = provIds[0];
                cityIds.forEach(cityId => {
                    if (mapData.getParentId(cityId)) return;
                    mapData.cityToProvince[cityId] = provId;
                    if (!mapData.provinceCities[provId]) mapData.provinceCities[provId] = [];
                    if (!mapData.provinceCities[provId].includes(cityId))
                        mapData.provinceCities[provId].push(cityId);
                });
            }
        });
    }

    handleRegionClick(regionId, pathElement) {
        mapData.toggleVisit(regionId);
        const isNowVisited = mapData.isVisited(regionId);
        if (isNowVisited) {
            this.updateRegionVisual(pathElement, mapData.getGovernanceLevel(regionId));
        } else {
            this.updateRegionVisual(pathElement, 0);
        }
        this.propagateVisit(regionId, isNowVisited);
        this.showRegionInfo(regionId, pathElement);
        this.updateUI();
    }

    propagateVisit(regionId, isNowVisited) {
        const parentId = mapData.getParentId(regionId);
        if (!parentId) return;

        if (isNowVisited) {
            // Mark parent whenever any child is marked
            if (!mapData.isVisited(parentId)) {
                mapData.addVisit(parentId);
                this.updateRegionVisualAll(parentId, mapData.getGovernanceLevel(parentId));
                this.propagateVisit(parentId, true);
            }
        } else {
            // Unmark parent only when no children remain visited
            if (mapData.isVisited(parentId) && !mapData.hasAnyChildVisited(parentId)) {
                mapData.removeVisit(parentId);
                this.updateRegionVisualAll(parentId, 0);
                this.propagateVisit(parentId, false);
            }
        }
    }

    updateRegionVisual(pathElement, level) {
        pathElement.classList.remove('visited-level1', 'visited-level2', 'visited-level3');
        if (level === 1) pathElement.classList.add('visited-level1');
        else if (level === 2) pathElement.classList.add('visited-level2');
        else if (level === 3) pathElement.classList.add('visited-level3');
    }

    // Update all SVG paths registered under a given regionId (handles duplicate IDs)
    updateRegionVisualAll(regionId, level) {
        const paths = this.regionsIndex[regionId];
        if (!paths) return;
        paths.forEach(p => this.updateRegionVisual(p, level));
    }

    markRegionVisited(pathElement) {
        this.updateRegionVisual(pathElement, 1);
    }

    markRegionUnvisited(pathElement) {
        this.updateRegionVisual(pathElement, 0);
    }

    // ── Search ────────────────────────────────────────────────────────────

    getDisplayName(regionId) {
        const baseId = mapData.getBaseId(regionId);
        const names = window.regionNames || {};
        // Direct lookup (province or city)
        if (names[baseId]) return names[baseId];
        // For counties: return code + parent city name
        const parentId = mapData.getParentId(regionId);
        if (parentId) {
            const parentBase = mapData.getBaseId(parentId);
            const parentName = names[parentBase] || parentBase;
            return `${parentName}-${baseId}`;
        }
        return baseId;
    }

    handleSearch(query) {
        const resultsEl = document.getElementById('searchResults');
        query = query.trim();
        if (!query) { resultsEl.innerHTML = ''; return; }

        const names = window.regionNames || {};
        const q = query.toLowerCase();
        const govLabels = { 1: '县', 2: '市', 3: '省' };
        const matches = [];

        // Search provinces & cities by name (from regionNames) + counties by parent name or code
        const allIds = Object.keys(map.regionsIndex);
        for (const regionId of allIds) {
            const baseId = mapData.getBaseId(regionId);
            const govLevel = mapData.getGovernanceLevel(regionId);
            const directName = names[baseId] || '';
            const displayName = this.getDisplayName(regionId);

            const matchesQuery =
                directName.includes(query) ||
                displayName.includes(query) ||
                baseId.includes(q) ||
                regionId.includes(q);

            if (matchesQuery) {
                matches.push({ regionId, displayName, govLevel });
                if (matches.length >= 30) break;
            }
        }

        // Sort: provinces first, then cities, then counties
        matches.sort((a, b) => b.govLevel - a.govLevel || a.displayName.localeCompare(b.displayName));

        if (matches.length === 0) {
            resultsEl.innerHTML = '<div class="search-empty">无结果</div>';
            return;
        }

        const html = matches.map(({ regionId, displayName, govLevel }) => {
            const visited = mapData.isVisited(regionId);
            return `<div class="search-result-item${visited ? ' visited' : ''}" data-id="${regionId}">
                <span class="search-result-name">${displayName}</span>
                <span class="search-result-level">${govLabels[govLevel]}</span>
                ${visited ? '<span class="search-result-check">✓</span>' : ''}
            </div>`;
        }).join('');

        resultsEl.innerHTML = html;
        resultsEl.querySelectorAll('.search-result-item').forEach(el => {
            el.addEventListener('click', () => this.toggleFromSearch(el.dataset.id, el));
        });
    }

    toggleFromSearch(regionId, el) {
        mapData.toggleVisit(regionId);
        const isNow = mapData.isVisited(regionId);
        this.propagateVisit(regionId, isNow);
        // Update visual on map
        this.updateRegionVisualAll(regionId, isNow ? mapData.getGovernanceLevel(regionId) : 0);
        // Refresh result row
        el.classList.toggle('visited', isNow);
        const check = el.querySelector('.search-result-check');
        if (isNow && !check) {
            el.insertAdjacentHTML('beforeend', '<span class="search-result-check">✓</span>');
        } else if (!isNow && check) {
            check.remove();
        }
        this.updateUI();
    }

    // ─────────────────────────────────────────────────────────────────────────

    showRegionInfo(regionId, pathElement) {
        const regionName = mapData.getRegionName(regionId);
        const isVisited = mapData.isVisited(regionId);
        const govLevel = mapData.getGovernanceLevel(regionId);
        const govLabels = { 1: '县', 2: '市', 3: '省' };
        const govLabel = govLabels[govLevel];

        // Build parent chain
        const chain = [{ id: regionId, name: regionName, level: govLevel }];
        let cur = regionId;
        while (true) {
            const parentId = mapData.getParentId(cur);
            if (!parentId) break;
            chain.push({ id: parentId, name: mapData.getRegionName(parentId), level: mapData.getGovernanceLevel(parentId) });
            cur = parentId;
        }

        // Render parent chain (from current region up to province)
        let chainHtml = '';
        if (chain.length > 1) {
            chainHtml = '<div class="region-chain">';
            chain.forEach((item, i) => {
                const label = govLabels[item.level] || '';
                const visited = mapData.isVisited(item.id);
                const indent = `margin-left:${i * 12}px`;
                if (i === 0) {
                    chainHtml += `<div class="chain-item chain-self" style="${indent}">▶ [${label}] ${item.name}${visited ? ' ✓' : ''}</div>`;
                } else {
                    chainHtml += `<div class="chain-item chain-parent" style="${indent}">↑ [${label}] ${item.name}${visited ? ' ✓' : ''}</div>`;
                }
            });
            chainHtml += '</div>';
        }

        const detailsContent = document.getElementById('detailsContent');
        detailsContent.innerHTML = `
            <div>
                <p><strong>${regionName}</strong> <span style="color:#888">[${govLabel}]</span></p>
                <p><strong>状态：</strong> ${isVisited ? '<span style="color:#667eea">✓ 已访问</span>' : '未访问'}</p>
                ${chainHtml}
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
        // Update statistics — compute totals from actual SVG paths to avoid double-counting
        // Filter out non-region paths (e.g. guide lines that accidentally match the -3 suffix pattern)
        const stats = mapData.getStats();
        const isRealRegion = (id) => /^_\d{6}_/.test(id);
        const totalProvinces = Object.keys(this.regionsIndex).filter(id => mapData.getGovernanceLevel(id) === 3 && isRealRegion(id)).length;
        const totalCities    = Object.keys(this.regionsIndex).filter(id => mapData.getGovernanceLevel(id) === 2 && isRealRegion(id)).length;
        const totalCounties  = Object.keys(this.regionsIndex).filter(id => mapData.getGovernanceLevel(id) === 1 && isRealRegion(id)).length;
        const fmt = (n, total) => total > 0
            ? `${n} / ${total} (${Math.round(n / total * 100)}%)`
            : `${n}`;
        document.getElementById('provinceCount').textContent = fmt(stats.provinces, totalProvinces);
        document.getElementById('cityCount').textContent = fmt(stats.cities, totalCities);
        document.getElementById('countyCount').textContent = fmt(stats.counties, totalCounties);

        // Update visited list
        this.updateVisitedList();
        this.updateUnvisitedList();
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
            const govDisplay = { 1: '县', 2: '市', 3: '省' }[item.govLevel] || '';

            html += `
                <div class="visit-item" data-region-id="${item.regionId}" data-type="${item.type}">
                    <span class="visit-item-level level-${item.govLevel}"></span>
                    <div class="visit-item-name">${item.name}</div>
                    <div class="visit-item-type">${govDisplay}</div>
                    <button class="visit-item-remove" data-region-id="${item.regionId}" data-type="${item.type}" title="移除">✕</button>
                </div>
            `;
        });

        listContent.innerHTML = html;

        // Add click listeners to visited items
        listContent.querySelectorAll('.visit-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('visit-item-remove')) return;
                const regionId = item.getAttribute('data-region-id');
                const pathEl = (this.regionsIndex[regionId] || [])[0];
                if (pathEl) {
                    pathEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    pathEl.style.animation = 'pulse 0.6s ease-in-out';
                }
            });
        });

        // Add remove button listeners
        listContent.querySelectorAll('.visit-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const regionId = btn.getAttribute('data-region-id');
                const type = btn.getAttribute('data-type');
                mapData.removeVisit(regionId, type);
                this.updateRegionVisualAll(regionId, 0);
                this.propagateVisit(regionId, false);
                this.updateUI();
            });
        });
    }

    updateUnvisitedList() {
        const content = document.getElementById('unvisitedListContent');
        if (!content) return;

        // Helper: extract Chinese name from ID like "_110000_北京市-3" → "北京市"
        const extractName = (id) => {
            const m = id.match(/^_\d+_(.+?)(?:-[23])?$/);
            return m ? m[1] : mapData.getRegionName(id);
        };

        // Active filter level ('all', '3', '2', '1')
        const activeFilter = (document.querySelector('.uv-filter-btn.active') || {}).dataset?.level || 'all';

        // Get provinces from hierarchy maps that actually exist in the SVG
        const allProvinces = Object.keys(mapData.provinceCities)
            .filter(p => this.regionsIndex[p])
            .sort((a, b) => extractName(a).localeCompare(extractName(b), 'zh'));

        if (allProvinces.length === 0) {
            content.innerHTML = '<p class="uv-empty">地图数据加载中...</p>';
            return;
        }

        let html = '';

        allProvinces.forEach(provId => {
            const provVisited = mapData.isVisited(provId);
            const cities = (mapData.provinceCities[provId] || []).filter(c => this.regionsIndex[c]);
            const unvisitedCities = cities.filter(c => !mapData.isVisited(c));

            // Skip province if everything is visited
            if (provVisited && unvisitedCities.length === 0 && activeFilter === 'all') return;
            if (activeFilter === '3' && provVisited) return;
            if (activeFilter === '2' && unvisitedCities.length === 0) return;
            if (activeFilter === '1') {
                const hasUnvisitedCounty = cities.some(c =>
                    (mapData.cityCounties[c] || []).filter(k => this.regionsIndex[k]).some(k => !mapData.isVisited(k))
                );
                if (!hasUnvisitedCounty) return;
            }

            const provName = extractName(provId);

            if (activeFilter === '3') {
                html += `<div class="uv-prov" data-id="${provId}" style="cursor:pointer">
                    <span class="uv-name">${provName}</span>
                </div>`;
                return;
            }

            html += `<div class="uv-group">
                <div class="uv-prov" data-id="${provId}">
                    <span class="uv-arrow">▶</span>
                    <span class="uv-name ${provVisited ? 'uv-visited' : ''}">${provName}</span>
                    <span class="uv-badge">${activeFilter === '1' ? '' : unvisitedCities.length + '市'}</span>
                </div>
                <div class="uv-cities" hidden>`;

            // For county filter, iterate ALL cities (propagation may have marked cities as visited
            // even when they still have unvisited counties)
            const citiesToShow = activeFilter === '1' ? cities : unvisitedCities;

            citiesToShow.forEach(cityId => {
                const counties = (mapData.cityCounties[cityId] || []).filter(c => this.regionsIndex[c]);
                const unvisitedCounties = counties.filter(c => !mapData.isVisited(c));
                const cityName = extractName(cityId);

                if (activeFilter === '1') {
                    if (unvisitedCounties.length === 0) return;
                    // Show counties directly (no collapse)
                    html += `<div class="uv-city-group">
                        <div class="uv-city-label">${cityName}</div>
                        <div class="uv-counties-open">`;
                    unvisitedCounties.forEach(countyId => {
                        html += `<div class="uv-county" data-id="${countyId}">${extractName(countyId)}</div>`;
                    });
                    html += `</div></div>`;
                    return;
                }

                if (activeFilter === '2') {
                    html += `<div class="uv-city" data-id="${cityId}" style="margin-left:0">
                        <span class="uv-name">${cityName}</span>
                        <span class="uv-badge">(${unvisitedCounties.length}县)</span>
                    </div>`;
                    return;
                }

                html += `<div class="uv-city-group">
                    <div class="uv-city" data-id="${cityId}">
                        <span class="uv-arrow">▶</span>
                        <span class="uv-name">${cityName}</span>
                        <span class="uv-badge">${unvisitedCounties.length}县</span>
                    </div>
                    <div class="uv-counties" hidden>`;
                unvisitedCounties.forEach(countyId => {
                    html += `<div class="uv-county" data-id="${countyId}">${extractName(countyId)}</div>`;
                });
                html += `</div></div>`;
            });

            html += `</div></div>`;
        });

        content.innerHTML = html || '<p class="uv-empty">🎉 所有地区已访问！</p>';

        // Expand/collapse arrows
        content.querySelectorAll('.uv-prov[data-id], .uv-city[data-id]').forEach(header => {
            const arrow = header.querySelector('.uv-arrow');
            if (!arrow) return;
            arrow.addEventListener('click', (e) => {
                e.stopPropagation();
                const sibling = header.nextElementSibling;
                if (!sibling) return;
                const hidden = sibling.hasAttribute('hidden');
                if (hidden) { sibling.removeAttribute('hidden'); arrow.textContent = '▼'; }
                else { sibling.setAttribute('hidden', ''); arrow.textContent = '▶'; }
            });
        });

        // Click name to mark visited
        content.querySelectorAll('.uv-name').forEach(nameEl => {
            nameEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const header = nameEl.closest('[data-id]');
                if (!header) return;
                const regionId = header.getAttribute('data-id');
                mapData.addVisit(regionId);
                this.updateRegionVisualAll(regionId, mapData.getGovernanceLevel(regionId));
                this.propagateVisit(regionId, true);
                this.updateUI();
            });
        });

        // Click county to mark visited
        content.querySelectorAll('.uv-county[data-id]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const regionId = item.getAttribute('data-id');
                mapData.addVisit(regionId);
                this.updateRegionVisualAll(regionId, mapData.getGovernanceLevel(regionId));
                this.propagateVisit(regionId, true);
                this.updateUI();
            });
        });
    }

    clearAll() {
        if (confirm('确定要清除所有记录吗？此操作无法撤销。')) {
            mapData.clearAll();

            // Reset visual state for all registered paths
            Object.values(this.regionsIndex).forEach(paths => {
                paths.forEach(path => { if (path) this.markRegionUnvisited(path); });
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
                Object.values(this.regionsIndex).forEach(paths => {
                    paths.forEach(path => { if (path) this.markRegionUnvisited(path); });
                });

                // Update visual states for imported data
                mapData.visitedRegions.forEach(item => {
                    const [regionId] = item.split(':');
                    this.updateRegionVisualAll(regionId, mapData.getGovernanceLevel(regionId));
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
