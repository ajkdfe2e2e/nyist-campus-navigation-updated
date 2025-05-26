/**
 * 南阳理工学院校园导航系统
 * 管理员模式脚本 - 第4部分（数据存储和整合）
 * 作者：杨博文（2415929683）
 */

/**
 * 启动管理员模式脚本
 */
function initAdminMode() {
    // 添加地点管理事件监听器
    addLocationEventListeners();
    
    // 添加路径管理事件监听器
    addPathEventListeners();
    
    // 添加数据整合功能
    integrateWithMainScript();
}

/**
 * 与主脚本整合
 */
function integrateWithMainScript() {
    // 重写CampusData的方法以使用自定义数据
    const originalGetLocations = CampusData.getLocations;
    const originalGetPaths = CampusData.getPaths;
    const originalGetLocationById = CampusData.getLocationById;
    
    // 重写获取地点方法
    CampusData.getLocations = function(campus, category) {
        // 获取当前数据
        let locations = hasCustomData() ? currentLocations : originalGetLocations.call(CampusData);
        
        // 应用筛选
        if (campus && campus !== 'all') {
            locations = locations.filter(location => location.campus === campus);
        }
        
        if (category && category !== 'all') {
            locations = locations.filter(location => location.category === category);
        }
        
        return locations;
    };
    
    // 重写获取路径方法
    CampusData.getPaths = function() {
        return hasCustomData() ? currentPaths : originalGetPaths.call(CampusData);
    };
    
    // 重写获取地点通过ID方法
    CampusData.getLocationById = function(id) {
        if (hasCustomData()) {
            return currentLocations.find(location => location.id === id) || null;
        } else {
            return originalGetLocationById.call(CampusData, id);
        }
    };
}

/**
 * 检查是否有自定义数据
 * @returns {boolean} 是否有自定义数据
 */
function hasCustomData() {
    return localStorage.getItem('campusLocations') !== null && 
           localStorage.getItem('campusPaths') !== null;
}

/**
 * 从自定义数据初始化
 */
function initFromCustomData() {
    const locationsJson = localStorage.getItem('campusLocations');
    const pathsJson = localStorage.getItem('campusPaths');
    
    if (locationsJson && pathsJson) {
        try {
            // 解析数据
            currentLocations = JSON.parse(locationsJson);
            currentPaths = JSON.parse(pathsJson);
            
            // 更新原始数据备份
            originalLocations = JSON.parse(JSON.stringify(currentLocations));
            originalPaths = JSON.parse(JSON.stringify(currentPaths));
            
            console.log('从localStorage加载了自定义数据');
            
            // 重新刷新地图
            if (typeof MapView !== 'undefined' && typeof MapView.renderMap === 'function') {
                MapView.renderMap(currentLocations, currentPaths);
            }
            
            return true;
        } catch (error) {
            console.error('从localStorage加载数据时发生错误:', error);
        }
    }
    
    return false;
}

/**
 * 刷新地图
 */
function refreshMap() {
    // 重新渲染地图
    if (typeof MapView !== 'undefined' && typeof MapView.renderMap === 'function') {
        MapView.renderMap(currentLocations, currentPaths);
    }
}

// 当文档加载完成后，检查自定义数据并初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化自定义数据
    const hasCustom = initFromCustomData();
    
    // 初始化管理员模式
    initAdminMode();
    
    // 添加页脚以包含管理员触发器
    if (!document.querySelector('footer')) {
        const footer = document.createElement('footer');
        footer.className = 'mt-5 py-3 bg-light';
        footer.innerHTML = `
            <div class="container">
                <p class="text-center text-muted mb-0">南阳理工学院校园导航系统 &copy; 2025 杨博文</p>
            </div>
        `;
        document.body.appendChild(footer);
        
        // 重新设置管理员触发器
        setupAdminTrigger();
    }
});

// 在页面加载后初始化管理员模式
window.addEventListener('load', function() {
    // 初始化最大ID
    if (currentLocations.length > 0) {
        maxLocationId = Math.max(...currentLocations.map(location => location.id));
    }
    
    console.log('管理员模式初始化完成，点击页脚版权信息5次可激活管理模式');
});