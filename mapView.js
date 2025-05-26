/**
 * 南阳理工学院校园导航系统
 * 地图可视化组件
 * 作者：杨博文（2415929683）
 * 完成日期：2025.5.20
 */

// 地图配置
const MAP_CONFIG = {
    width: 1000, // 地图SVG宽度
    height: 800, // 地图SVG高度
    buildingRadius: 15, // 建筑物节点半径
    zoomStep: 0.2, // 缩放步长
    maxZoom: 3, // 最大缩放倍数
    minZoom: 0.5, // 最小缩放倍数
};

// 当前地图状态
const mapState = {
    zoom: 1, // 当前缩放倍数
    pan: { x: 0, y: 0 }, // 平移量
    selectedLocationId: null, // 当前选中的地点ID
    hightlightedPath: [], // 高亮显示的路径
    campusFilter: 'all', // 当前校区筛选
};

/**
 * 初始化地图
 * @param {string} containerId - 地图容器ID
 */
function initMap(containerId = 'campus-map') {
    // 创建SVG元素
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    // 创建SVG元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${MAP_CONFIG.width} ${MAP_CONFIG.height}`);
    svg.setAttribute('class', 'campus-map-svg');
    container.appendChild(svg);
    
    // 创建背景层
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('width', MAP_CONFIG.width);
    background.setAttribute('height', MAP_CONFIG.height);
    background.setAttribute('fill', '#f0f4f8');
    svg.appendChild(background);
    
    // 创建路径层
    const pathLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    pathLayer.setAttribute('id', 'path-layer');
    svg.appendChild(pathLayer);
    
    // 创建建筑物层
    const buildingLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    buildingLayer.setAttribute('id', 'building-layer');
    svg.appendChild(buildingLayer);
    
    // 创建标签层
    const labelLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    labelLayer.setAttribute('id', 'label-layer');
    svg.appendChild(labelLayer);
    
    // 创建高亮路径层
    const highlightLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    highlightLayer.setAttribute('id', 'highlight-layer');
    svg.appendChild(highlightLayer);
    
    // 添加拖动和缩放功能
    addDragAndZoom(svg);
    
    return svg;
}

/**
 * 添加拖动和缩放功能
 * @param {SVGElement} svg - SVG元素
 */
function addDragAndZoom(svg) {
    let isDragging = false;
    let startX, startY;
    
    // 鼠标按下事件处理函数
    const handleMouseDown = (event) => {
        // 只响应主鼠标按钮
        if (event.button !== 0) return;
        
        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;
        
        // 设置光标样式
        svg.style.cursor = 'grabbing';
    };
    
    // 鼠标移动事件处理函数
    const handleMouseMove = (event) => {
        if (!isDragging) return;
        
        // 计算移动距离
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        
        // 更新起始位置
        startX = event.clientX;
        startY = event.clientY;
        
        // 更新平移量
        mapState.pan.x += dx / mapState.zoom;
        mapState.pan.y += dy / mapState.zoom;
        
        // 应用变换
        updateTransform();
    };
    
    // 鼠标松开事件处理函数
    const handleMouseUp = () => {
        isDragging = false;
        
        // 恢复光标样式
        svg.style.cursor = 'grab';
    };
    
    // 鼠标滚轮事件处理函数
    const handleWheel = (event) => {
        event.preventDefault();
        
        // 计算新的缩放倍数
        const delta = event.deltaY < 0 ? MAP_CONFIG.zoomStep : -MAP_CONFIG.zoomStep;
        const newZoom = Math.max(MAP_CONFIG.minZoom, Math.min(MAP_CONFIG.maxZoom, mapState.zoom + delta));
        
        // 如果缩放倍数没有变化，直接返回
        if (newZoom === mapState.zoom) return;
        
        // 获取鼠标相对于SVG的位置
        const rect = svg.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // 计算鼠标在地图坐标系中的位置
        const mapX = mouseX / mapState.zoom - mapState.pan.x;
        const mapY = mouseY / mapState.zoom - mapState.pan.y;
        
        // 更新缩放倍数
        mapState.zoom = newZoom;
        
        // 调整平移量，使鼠标指向的点保持不变
        mapState.pan.x = mouseX / mapState.zoom - mapX;
        mapState.pan.y = mouseY / mapState.zoom - mapY;
        
        // 应用变换
        updateTransform();
    };
    
    // 添加事件监听器
    svg.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    svg.addEventListener('wheel', handleWheel);
    
    // 设置初始光标样式
    svg.style.cursor = 'grab';
    
    // 添加按钮事件监听
    document.getElementById('zoom-in').addEventListener('click', () => {
        // 放大按钮
        const newZoom = Math.min(MAP_CONFIG.maxZoom, mapState.zoom + MAP_CONFIG.zoomStep);
        mapState.zoom = newZoom;
        updateTransform();
    });
    
    document.getElementById('zoom-out').addEventListener('click', () => {
        // 缩小按钮
        const newZoom = Math.max(MAP_CONFIG.minZoom, mapState.zoom - MAP_CONFIG.zoomStep);
        mapState.zoom = newZoom;
        updateTransform();
    });
    
    document.getElementById('reset-view').addEventListener('click', () => {
        // 重置视图
        mapState.zoom = 1;
        mapState.pan = { x: 0, y: 0 };
        updateTransform();
    });
}

/**
 * 更新地图变换
 */
function updateTransform() {
    // 获取图层元素
    const buildingLayer = document.getElementById('building-layer');
    const pathLayer = document.getElementById('path-layer');
    const labelLayer = document.getElementById('label-layer');
    const highlightLayer = document.getElementById('highlight-layer');
    
    // 设置变换
    const transform = `translate(${mapState.pan.x}px, ${mapState.pan.y}px) scale(${mapState.zoom})`;
    
    // 应用变换
    buildingLayer.style.transform = transform;
    pathLayer.style.transform = transform;
    labelLayer.style.transform = transform;
    highlightLayer.style.transform = transform;
}

/**
 * 渲染地图
 * @param {Array} locations - 地点数据
 * @param {Array} paths - 路径数据
 * @param {string} campusFilter - 校区筛选
 */
function renderMap(locations, paths, campusFilter = 'all') {
    // 更新校区筛选
    mapState.campusFilter = campusFilter;
    
    // 过滤地点和路径
    const filteredLocations = filterLocationsByCampus(locations, campusFilter);
    const filteredPaths = filterPathsByCampus(paths, filteredLocations);
    
    // 初始化地图
    const svg = initMap();
    
    // 渲染路径
    renderPaths(filteredPaths);
    
    // 渲染建筑物
    renderBuildings(filteredLocations);
    
    // 渲染标签
    renderLabels(filteredLocations);
}

/**
 * 渲染路径
 * @param {Array} paths - 路径数据
 */
function renderPaths(paths) {
    const pathLayer = document.getElementById('path-layer');
    
    // 清空路径层
    pathLayer.innerHTML = '';
    
    // 绘制每条路径
    paths.forEach(path => {
        // 创建路径元素
        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        
        // 设置路径属性
        pathElement.setAttribute('x1', path.source.x);
        pathElement.setAttribute('y1', path.source.y);
        pathElement.setAttribute('x2', path.target.x);
        pathElement.setAttribute('y2', path.target.y);
        pathElement.setAttribute('stroke', '#adb5bd');
        pathElement.setAttribute('stroke-width', '3');
        
        // 添加到路径层
        pathLayer.appendChild(pathElement);
    });
}

/**
 * 渲染建筑物
 * @param {Array} locations - 地点数据
 */
function renderBuildings(locations) {
    const buildingLayer = document.getElementById('building-layer');
    
    // 清空建筑物层
    buildingLayer.innerHTML = '';
    
    // 绘制每个建筑物
    locations.forEach(location => {
        // 创建建筑物元素
        const building = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        
        // 设置建筑物属性
        building.setAttribute('cx', location.x);
        building.setAttribute('cy', location.y);
        building.setAttribute('r', MAP_CONFIG.buildingRadius);
        building.setAttribute('class', `building ${location.category.toLowerCase()}`);
        building.setAttribute('data-id', location.id);
        
        // 添加点击事件
        building.addEventListener('click', () => {
            selectLocation(location.id);
        });
        
        // 添加到建筑物层
        buildingLayer.appendChild(building);
    });
}

/**
 * 渲染标签
 * @param {Array} locations - 地点数据
 */
function renderLabels(locations) {
    const labelLayer = document.getElementById('label-layer');
    
    // 清空标签层
    labelLayer.innerHTML = '';
    
    // 绘制每个标签
    locations.forEach(location => {
        // 创建标签元素
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        
        // 设置标签属性
        label.setAttribute('x', location.x);
        label.setAttribute('y', location.y + MAP_CONFIG.buildingRadius + 15);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('class', 'location-label');
        label.setAttribute('data-id', location.id);
        label.textContent = location.name;
        
        // 添加点击事件
        label.addEventListener('click', () => {
            selectLocation(location.id);
        });
        
        // 添加到标签层
        labelLayer.appendChild(label);
    });
}

/**
 * 选中地点
 * @param {number} locationId - 地点ID
 */
function selectLocation(locationId) {
    // 更新选中状态
    mapState.selectedLocationId = locationId;
    
    // 移除所有选中状态
    const buildings = document.querySelectorAll('.building');
    buildings.forEach(building => {
        building.classList.remove('selected');
    });
    
    // 添加选中状态
    const selectedBuilding = document.querySelector(`.building[data-id="${locationId}"]`);
    if (selectedBuilding) {
        selectedBuilding.classList.add('selected');
    }
    
    // 触发选中事件
    const event = new CustomEvent('locationSelected', { detail: { id: locationId } });
    document.dispatchEvent(event);
}

/**
 * 高亮路径
 * @param {Array} path - 路径顶点ID数组
 * @param {Array} locations - 地点数据
 * @param {Array} allPaths - 所有路径数据
 */
function highlightPath(path, locations, allPaths) {
    // 清空高亮路径
    mapState.hightlightedPath = path;
    
    // 获取高亮层
    const highlightLayer = document.getElementById('highlight-layer');
    
    // 清空高亮层
    highlightLayer.innerHTML = '';
    
    // 如果路径为空，直接返回
    if (!path || path.length < 2) return;
    
    // 为路径中的每段创建高亮线段
    for (let i = 0; i < path.length - 1; i++) {
        const sourceId = path[i];
        const targetId = path[i + 1];
        
        // 查找对应的地点
        const source = locations.find(location => location.id === sourceId);
        const target = locations.find(location => location.id === targetId);
        
        if (!source || !target) continue;
        
        // 创建路径元素
        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        
        // 设置路径属性
        pathElement.setAttribute('x1', source.x);
        pathElement.setAttribute('y1', source.y);
        pathElement.setAttribute('x2', target.x);
        pathElement.setAttribute('y2', target.y);
        pathElement.setAttribute('class', 'path');
        
        // 添加到高亮层
        highlightLayer.appendChild(pathElement);
    }
}

/**
 * 按校区筛选地点
 * @param {Array} locations - 地点数据
 * @param {string} campus - 校区筛选
 * @returns {Array} 筛选后的地点
 */
function filterLocationsByCampus(locations, campus) {
    if (campus === 'all') return locations;
    return locations.filter(location => location.campus === campus);
}

/**
 * 按校区筛选路径
 * @param {Array} paths - 路径数据
 * @param {Array} filteredLocations - 筛选后的地点
 * @returns {Array} 筛选后的路径
 */
function filterPathsByCampus(paths, filteredLocations) {
    // 获取筛选后的地点ID
    const locationIds = filteredLocations.map(location => location.id);
    
    // 筛选路径
    return paths.filter(path => 
        locationIds.includes(path.sourceId) && 
        locationIds.includes(path.targetId)
    );
}

/**
 * 设置校区筛选
 * @param {string} campus - 校区筛选
 */
function setCampusFilter(campus) {
    mapState.campusFilter = campus;
    
    // 触发校区筛选事件
    const event = new CustomEvent('campusFilterChanged', { detail: { campus } });
    document.dispatchEvent(event);
}

// 导出模块
const MapView = {
    renderMap,
    selectLocation,
    highlightPath,
    setCampusFilter
};