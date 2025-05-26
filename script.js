/**
 * 南阳理工学院校园导航系统
 * 主脚本文件
 * 作者：杨博文（2415929683）
 * 完成日期：2025.5.20
 */

// 当页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 初始化地图
    MapView.renderMap(CampusData.getLocations(), CampusData.getPaths());
    
    // 初始化地点列表
    initLocationList();
    
    // 初始化选择框
    initSelects();
    
    // 添加事件监听器
    addEventListeners();
    
    // 初始化工具提示
    initTooltips();
    
    // 显示欢迎信息
    showWelcomeAlert();
});

/**
 * 初始化地点列表
 */
function initLocationList() {
    const locationList = document.getElementById('location-list');
    if (!locationList) return;
    
    // 获取所有地点并按名称排序
    const locations = CampusData.getLocations();
    locations.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    
    // 创建地点列表项
    locations.forEach(location => {
        const item = document.createElement('button');
        item.className = 'list-group-item list-group-item-action';
        item.setAttribute('data-id', location.id);
        item.textContent = location.name;
        
        // 添加点击事件
        item.addEventListener('click', () => {
            selectLocation(location.id);
        });
        
        // 添加到列表
        locationList.appendChild(item);
    });
}

/**
 * 初始化起点和终点选择框
 */
function initSelects() {
    const startSelect = document.getElementById('start-location');
    const endSelect = document.getElementById('end-location');
    if (!startSelect || !endSelect) return;
    
    // 获取所有地点并按名称排序
    const locations = CampusData.getLocations();
    locations.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    
    // 按校区分组
    const campusGroups = {
        "west-north": document.createElement('optgroup'),
        "east-south": document.createElement('optgroup')
    };
    
    // 设置分组标签
    campusGroups["west-north"].label = '西北校区(北校区)';
    campusGroups["east-south"].label = '东南校区(东校区)';
    
    // 创建选项
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location.id;
        option.textContent = location.name;
        
        // 添加到对应的分组
        if (campusGroups[location.campus]) {
            campusGroups[location.campus].appendChild(option.cloneNode(true));
        }
    });
    
    // 添加分组到选择框
    for (const campus in campusGroups) {
        if (campusGroups[campus].hasChildNodes()) {
            startSelect.appendChild(campusGroups[campus].cloneNode(true));
            endSelect.appendChild(campusGroups[campus].cloneNode(true));
        }
    }
}

/**
 * 添加事件监听器
 */
function addEventListeners() {
    // 校区切换
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            
            // 更新激活状态
            document.querySelectorAll('.navbar-nav .nav-link').forEach(item => {
                item.classList.remove('active');
            });
            link.classList.add('active');
            
            // 设置校区筛选
            const campus = link.getAttribute('data-campus');
            MapView.setCampusFilter(campus);
            
            // 更新地点列表
            updateLocationList(campus);
        });
    });
    
    // 分类筛选
    document.querySelectorAll('.list-group-item[data-category]').forEach(item => {
        item.addEventListener('click', () => {
            // 更新激活状态
            document.querySelectorAll('.list-group-item[data-category]').forEach(btn => {
                btn.classList.remove('active');
            });
            item.classList.add('active');
            
            // 获取分类
            const category = item.getAttribute('data-category');
            
            // 获取当前校区筛选
            const currentCampus = document.querySelector('.navbar-nav .nav-link.active').getAttribute('data-campus');
            
            // 更新地点列表
            updateLocationList(currentCampus, category);
        });
    });
    
    // 搜索
    document.getElementById('search-button').addEventListener('click', handleSearch);
    document.getElementById('search-input').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });
    
    // 路径查询表单
    document.getElementById('path-form').addEventListener('submit', (event) => {
        event.preventDefault();
        findPath();
    });
    
    // 选择地点
    document.addEventListener('locationSelected', (event) => {
        const locationId = event.detail.id;
        
        // 高亮显示列表项
        highlightLocationInList(locationId);
        
        // 显示地点信息
        showLocationInfo(locationId);
    });
}

/**
 * 更新地点列表
 * @param {string} campus - 校区筛选
 * @param {string} category - 类别筛选
 */
function updateLocationList(campus = 'all', category = 'all') {
    const locationList = document.getElementById('location-list');
    if (!locationList) return;
    
    // 清空列表
    locationList.innerHTML = '';
    
    // 获取所有地点
    let locations = CampusData.getLocations();
    
    // 按校区筛选
    if (campus !== 'all') {
        locations = locations.filter(location => location.campus === campus);
    }
    
    // 按类别筛选
    if (category !== 'all') {
        locations = locations.filter(location => location.category === category);
    }
    
    // 按名称排序
    locations.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    
    // 创建地点列表项
    locations.forEach(location => {
        const item = document.createElement('button');
        item.className = 'list-group-item list-group-item-action';
        item.setAttribute('data-id', location.id);
        item.textContent = location.name;
        
        // 添加点击事件
        item.addEventListener('click', () => {
            selectLocation(location.id);
        });
        
        // 添加到列表
        locationList.appendChild(item);
    });
}

/**
 * 处理搜索
 */
function handleSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    // 获取搜索关键词
    const keyword = searchInput.value.trim();
    if (!keyword) return;
    
    // 获取所有地点
    const locations = CampusData.getLocations();
    
    // 搜索匹配的地点
    const matchedLocations = locations.filter(location => 
        location.name.includes(keyword) || 
        (location.alias && location.alias.some(alias => alias.includes(keyword)))
    );
    
    // 如果没有匹配的地点，显示提示
    if (matchedLocations.length === 0) {
        showAlert(`没有找到包含"${keyword}"的地点`, 'warning');
        return;
    }
    
    // 如果只有一个匹配的地点，直接选择
    if (matchedLocations.length === 1) {
        selectLocation(matchedLocations[0].id);
        return;
    }
    
    // 如果有多个匹配的地点，更新地点列表
    const locationList = document.getElementById('location-list');
    if (!locationList) return;
    
    // 清空列表
    locationList.innerHTML = '';
    
    // 创建标题
    const title = document.createElement('div');
    title.className = 'list-group-item list-group-item-primary';
    title.textContent = `找到 ${matchedLocations.length} 个匹配"${keyword}"的地点`;
    locationList.appendChild(title);
    
    // 创建地点列表项
    matchedLocations.forEach(location => {
        const item = document.createElement('button');
        item.className = 'list-group-item list-group-item-action';
        item.setAttribute('data-id', location.id);
        item.textContent = location.name;
        
        // 添加点击事件
        item.addEventListener('click', () => {
            selectLocation(location.id);
        });
        
        // 添加到列表
        locationList.appendChild(item);
    });
}

/**
 * 选择地点
 * @param {number} locationId - 地点ID
 */
function selectLocation(locationId) {
    // 获取地点
    const location = CampusData.getLocationById(locationId);
    if (!location) return;
    
    // 调用地图选择地点
    MapView.selectLocation(locationId);
    
    // 高亮显示列表项
    highlightLocationInList(locationId);
    
    // 显示地点信息
    showLocationInfo(location);
}

/**
 * 高亮显示列表项
 * @param {number} locationId - 地点ID
 */
function highlightLocationInList(locationId) {
    // 移除所有列表项的激活状态
    document.querySelectorAll('#location-list .list-group-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 添加激活状态
    const listItem = document.querySelector(`#location-list .list-group-item[data-id="${locationId}"]`);
    if (listItem) {
        listItem.classList.add('active');
        listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * 显示地点信息
 * @param {Object} location - 地点对象
 */
function showLocationInfo(location) {
    // 如果参数是ID，获取地点对象
    if (typeof location === 'number') {
        location = CampusData.getLocationById(location);
    }
    
    if (!location) return;
    
    // 显示地点信息弹窗
    showAlert(`
        <h5>${location.name}</h5>
        <p><strong>类别:</strong> ${location.category}</p>
        <p><strong>校区:</strong> ${location.campus === 'west-north' ? '西北校区(北校区)' : '东南校区(东校区)'}</p>
        ${location.description ? `<p>${location.description}</p>` : ''}
    `, 'info');
}

/**
 * 查找路径
 */
function findPath() {
    // 获取起点和终点
    const startId = parseInt(document.getElementById('start-location').value);
    const endId = parseInt(document.getElementById('end-location').value);
    
    // 获取路径类型
    const pathType = document.querySelector('input[name="path-type"]:checked').value;
    
    // 验证起点和终点
    if (isNaN(startId) || isNaN(endId)) {
        showAlert('请选择起点和终点', 'warning');
        return;
    }
    
    if (startId === endId) {
        showAlert('起点和终点不能相同', 'warning');
        return;
    }
    
    // 获取图结构
    const graph = CampusData.getGraphStructure();
    
    // 查找最短路径
    const result = PathFinding.findShortestPath(graph, startId, endId, pathType);
    
    // 如果没有找到路径
    if (result.path.length === 0) {
        showAlert('未找到从起点到终点的路径', 'warning');
        return;
    }
    
    // 高亮显示路径
    MapView.highlightPath(result.path, CampusData.getLocations(), CampusData.getPaths());
    
    // 显示路径结果
    showPathResult(result);
}

/**
 * 显示路径结果
 * @param {Object} result - 路径结果
 */
function showPathResult(result) {
    // 显示结果区域
    const pathResults = document.getElementById('path-results');
    pathResults.classList.remove('d-none');
    
    // 更新总距离和总时间
    document.getElementById('total-distance').textContent = result.totalDistance;
    document.getElementById('total-time').textContent = result.totalTime.toFixed(1);
    
    // 获取路径详情列表
    const pathDetails = document.getElementById('path-details');
    pathDetails.innerHTML = '';
    
    // 创建路径详情
    const path = result.path;
    for (let i = 0; i < path.length; i++) {
        const locationId = path[i];
        const location = CampusData.getLocationById(locationId);
        
        // 创建列表项
        const item = document.createElement('li');
        item.textContent = location.name;
        
        // 如果不是终点，添加路径说明
        if (i < path.length - 1) {
            const nextLocationId = path[i + 1];
            const nextLocation = CampusData.getLocationById(nextLocationId);
            
            // 获取路径
            const pathInfo = CampusData.getPathBetween(locationId, nextLocationId);
            
            if (pathInfo) {
                const pathDetail = document.createElement('div');
                pathDetail.className = 'text-muted small';
                pathDetail.innerHTML = `
                    <i class="bi bi-arrow-right"></i> 前往${nextLocation.name}
                    <span class="ms-2">(${pathInfo.distance}米, 约${pathInfo.time.toFixed(1)}分钟)</span>
                `;
                item.appendChild(pathDetail);
            }
        }
        
        // 添加到列表
        pathDetails.appendChild(item);
    }
    
    // 滚动到结果区域
    pathResults.scrollIntoView({ behavior: 'smooth' });
}

/**
 * 显示提示弹窗
 * @param {string} message - 提示信息
 * @param {string} type - 提示类型
 */
function showAlert(message, type = 'info') {
    // 创建弹窗容器
    let alertContainer = document.getElementById('alert-container');
    
    // 如果容器不存在，创建一个
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.className = 'position-fixed top-0 start-50 translate-middle-x p-3';
        alertContainer.style.zIndex = '1050';
        document.body.appendChild(alertContainer);
    }
    
    // 创建弹窗元素
    const alertId = `alert-${Date.now()}`;
    const alertElement = document.createElement('div');
    alertElement.id = alertId;
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // 添加到容器
    alertContainer.appendChild(alertElement);
    
    // 3秒后自动关闭
    setTimeout(() => {
        const alert = document.getElementById(alertId);
        if (alert) {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
        }
    }, 3000);
}

/**
 * 初始化工具提示
 */
function initTooltips() {
    // Bootstrap的工具提示初始化
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * 显示欢迎信息
 */
function showWelcomeAlert() {
    showAlert(`
        <h4>欢迎使用南阳理工学院校园导航系统</h4>
        <p>本系统可以帮助您查找校园内的各个地点，并计算最优路径。</p>
        <p>使用说明：点击地图上的地点或从左侧列表选择地点，在右侧面板选择起点和终点后点击"查询路径"按钮。</p>
    `, 'primary');
}