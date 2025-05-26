/**
 * 南阳理工学院校园导航系统
 * 管理员模式脚本
 * 包含节点和路径管理功能
 * 作者：杨博文（2415929683）
 */

// 管理员模式状态
let adminMode = false;
let clickCount = 0;
let clickTimer = null;

// 存储原始数据的备份
let originalLocations = [];
let originalPaths = [];

// 当前编辑的数据
let currentLocations = [];
let currentPaths = [];

// 最大ID值
let maxLocationId = 0;

// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 添加管理员模式CSS
    addAdminStyles();
    
    // 创建管理员面板
    createAdminPanel();
    
    // 设置管理员模式触发器
    setupAdminTrigger();
    
    // 从localStorage加载数据
    loadDataFromLocalStorage();
});

/**
 * 添加管理员模式CSS
 */
function addAdminStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'adminStyles.css';
    document.head.appendChild(link);
}

/**
 * 设置管理员模式触发器
 */
function setupAdminTrigger() {
    // 使用页脚版权信息作为触发器
    const footerText = document.querySelector('footer p:last-child');
    
    if (footerText) {
        footerText.classList.add('admin-trigger');
        
        footerText.addEventListener('click', function(event) {
            clickCount++;
            
            // 清除之前的定时器
            if (clickTimer) {
                clearTimeout(clickTimer);
            }
            
            // 设置新的定时器，3秒后重置点击计数
            clickTimer = setTimeout(function() {
                clickCount = 0;
            }, 3000);
            
            // 如果点击了5次，激活管理员模式
            if (clickCount >= 5) {
                activateAdminMode();
                clickCount = 0;
                
                // 阻止事件冒泡
                event.stopPropagation();
            }
        });
    }
}

/**
 * 创建管理员面板
 */
function createAdminPanel() {
    // 创建管理员面板容器
    const adminPanel = document.createElement('div');
    adminPanel.id = 'admin-panel';
    adminPanel.className = 'admin-panel';
    
    // 添加面板内容
    adminPanel.innerHTML = `
        <div class="admin-panel-header">
            <h2>南阳理工学院校园导航系统 - 管理员模式</h2>
            <button id="admin-close-btn" class="admin-close-btn">关闭</button>
        </div>
        
        <div class="admin-tabs">
            <div class="admin-tab active" data-tab="locations">节点管理</div>
            <div class="admin-tab" data-tab="paths">路径管理</div>
        </div>
        
        <div class="admin-tab-content active" id="locations-tab">
            <div class="admin-form-group">
                <button id="add-location-btn" class="admin-btn admin-btn-primary">添加新节点</button>
                <button id="save-locations-btn" class="admin-btn admin-btn-secondary">保存更改</button>
                <button id="cancel-locations-btn" class="admin-btn admin-btn-danger">取消更改</button>
            </div>
            
            <div id="location-form-container" class="admin-hidden">
                <h3 id="location-form-title">添加新节点</h3>
                <form id="location-form" class="admin-form">
                    <input type="hidden" id="location-id">
                    
                    <div class="admin-form-group">
                        <label for="location-name">名称：</label>
                        <input type="text" id="location-name" class="admin-form-control" required>
                    </div>
                    
                    <div class="admin-form-group">
                        <label for="location-description">描述：</label>
                        <textarea id="location-description" class="admin-form-control" rows="3"></textarea>
                    </div>
                    
                    <div class="admin-form-group">
                        <label for="location-category">类别：</label>
                        <select id="location-category" class="admin-form-control" required>
                            <option value="教学楼">教学楼</option>
                            <option value="宿舍">宿舍</option>
                            <option value="餐饮">餐饮</option>
                            <option value="学习场所">学习场所</option>
                            <option value="运动场所">运动场所</option>
                            <option value="出入口">出入口</option>
                            <option value="行政">行政</option>
                            <option value="医疗">医疗</option>
                            <option value="生活服务">生活服务</option>
                        </select>
                    </div>
                    
                    <div class="admin-form-group">
                        <label for="location-campus">校区：</label>
                        <select id="location-campus" class="admin-form-control" required>
                            <option value="west-north">西北校区(北校区)</option>
                            <option value="east-south">东南校区(东校区)</option>
                        </select>
                    </div>
                    
                    <div class="admin-form-group">
                        <label for="location-x">X坐标：</label>
                        <input type="number" id="location-x" class="admin-form-control" required min="0" max="1000">
                    </div>
                    
                    <div class="admin-form-group">
                        <label for="location-y">Y坐标：</label>
                        <input type="number" id="location-y" class="admin-form-control" required min="0" max="800">
                    </div>
                    
                    <div class="admin-form-group">
                        <button type="submit" class="admin-btn admin-btn-primary">保存</button>
                        <button type="button" id="cancel-location-form-btn" class="admin-btn admin-btn-secondary">取消</button>
                    </div>
                </form>
            </div>
            
            <table class="admin-table" id="locations-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>名称</th>
                        <th>类别</th>
                        <th>校区</th>
                        <th>坐标</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 地点数据行将在这里动态生成 -->
                </tbody>
            </table>
        </div>
        
        <div class="admin-tab-content" id="paths-tab">
            <div class="admin-form-group">
                <button id="add-path-btn" class="admin-btn admin-btn-primary">添加新路径</button>
                <button id="save-paths-btn" class="admin-btn admin-btn-secondary">保存更改</button>
                <button id="cancel-paths-btn" class="admin-btn admin-btn-danger">取消更改</button>
            </div>
            
            <div id="path-form-container" class="admin-hidden">
                <h3 id="path-form-title">添加新路径</h3>
                <form id="path-form" class="admin-form">
                    <input type="hidden" id="path-index">
                    
                    <div class="admin-form-group">
                        <label for="path-source">起点：</label>
                        <select id="path-source" class="admin-form-control" required>
                            <!-- 地点选项将在这里动态生成 -->
                        </select>
                    </div>
                    
                    <div class="admin-form-group">
                        <label for="path-target">终点：</label>
                        <select id="path-target" class="admin-form-control" required>
                            <!-- 地点选项将在这里动态生成 -->
                        </select>
                    </div>
                    
                    <div class="admin-form-group">
                        <label for="path-distance">距离（米）：</label>
                        <input type="number" id="path-distance" class="admin-form-control" required min="1">
                    </div>
                    
                    <div class="admin-form-group">
                        <label for="path-time">时间（分钟）：</label>
                        <input type="number" id="path-time" class="admin-form-control" required min="0.1" step="0.1">
                    </div>
                    
                    <div class="admin-form-group">
                        <button type="submit" class="admin-btn admin-btn-primary">保存</button>
                        <button type="button" id="cancel-path-form-btn" class="admin-btn admin-btn-secondary">取消</button>
                    </div>
                </form>
            </div>
            
            <table class="admin-table" id="paths-table">
                <thead>
                    <tr>
                        <th>起点</th>
                        <th>终点</th>
                        <th>距离（米）</th>
                        <th>时间（分钟）</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 路径数据行将在这里动态生成 -->
                </tbody>
            </table>
        </div>
    `;
    
    // 添加到文档
    document.body.appendChild(adminPanel);
    
    // 添加事件监听器
    addAdminPanelEventListeners();
}

/**
 * 添加管理员面板事件监听器
 */
function addAdminPanelEventListeners() {
    // 关闭按钮
    document.getElementById('admin-close-btn').addEventListener('click', deactivateAdminMode);
    
    // 选项卡切换
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有选项卡的活动状态
            document.querySelectorAll('.admin-tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // 移除所有内容的活动状态
            document.querySelectorAll('.admin-tab-content').forEach(c => {
                c.classList.remove('active');
            });
            
            // 添加当前选项卡的活动状态
            this.classList.add('active');
            
            // 显示对应的内容
            const tabId = this.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // 其他事件监听器将在后续部分添加
}

/**
 * 激活管理员模式
 */
function activateAdminMode() {
    console.log('管理员模式已激活');
    adminMode = true;
    
    // 备份原始数据
    backupOriginalData();
    
    // 显示管理员面板
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
        adminPanel.classList.add('active');
    }
    
    // 添加管理员模式样式到body
    document.body.classList.add('admin-mode');
    
    // 重新加载数据到表格
    refreshLocationTable();
    refreshPathTable();
    
    // 隐藏表单
    document.getElementById('location-form-container').classList.add('admin-hidden');
    document.getElementById('path-form-container').classList.add('admin-hidden');
}

/**
 * 取消管理员模式
 */
function deactivateAdminMode() {
    console.log('管理员模式已关闭');
    adminMode = false;
    
    // 隐藏管理员面板
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
        adminPanel.classList.remove('active');
    }
    
    // 移除管理员模式样式
    document.body.classList.remove('admin-mode');
}

/**
 * 备份原始数据
 */
function backupOriginalData() {
    // 备份地点数据
    originalLocations = JSON.parse(JSON.stringify(CampusData.getLocations()));
    
    // 备份路径数据
    originalPaths = JSON.parse(JSON.stringify(CampusData.getPaths()));
    
    // 复制数据到当前编辑数据
    currentLocations = JSON.parse(JSON.stringify(originalLocations));
    currentPaths = JSON.parse(JSON.stringify(originalPaths));
    
    // 计算最大ID
    maxLocationId = 0;
    for (const location of currentLocations) {
        if (location.id > maxLocationId) {
            maxLocationId = location.id;
        }
    }
}

/**
 * 从localStorage加载数据
 */
function loadDataFromLocalStorage() {
    // 尝试从localStorage加载数据
    const savedLocations = localStorage.getItem('campusLocations');
    const savedPaths = localStorage.getItem('campusPaths');
    
    if (savedLocations && savedPaths) {
        try {
            // 解析数据
            const locations = JSON.parse(savedLocations);
            const paths = JSON.parse(savedPaths);
            
            // 更新内存中的数据
            // 注意：这需要修改原始代码中的数据结构，稍后会添加更多功能
            console.log('从localStorage加载了自定义数据');
        } catch (error) {
            console.error('从localStorage加载数据时发生错误:', error);
        }
    }
}

// 将在后续部分添加节点管理、路径管理和数据存储的功能