/**
 * 南阳理工学院校园导航系统
 * 管理员模式脚本 - 第2部分（节点管理功能）
 * 作者：杨博文（2415929683）
 */

/**
 * 刷新地点表格
 */
function refreshLocationTable() {
    const tableBody = document.querySelector('#locations-table tbody');
    if (!tableBody) return;
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 按ID排序
    currentLocations.sort((a, b) => a.id - b.id);
    
    // 添加地点行
    for (const location of currentLocations) {
        const row = document.createElement('tr');
        
        // 校区显示
        const campusName = location.campus === 'west-north' ? '西北校区' : '东南校区';
        
        // 创建行内容
        row.innerHTML = `
            <td>${location.id}</td>
            <td>${location.name}</td>
            <td>${location.category}</td>
            <td>${campusName}</td>
            <td>(${location.x}, ${location.y})</td>
            <td class="admin-actions">
                <button class="admin-btn admin-btn-secondary edit-location" data-id="${location.id}">编辑</button>
                <button class="admin-btn admin-btn-danger delete-location" data-id="${location.id}">删除</button>
            </td>
        `;
        
        // 添加到表格
        tableBody.appendChild(row);
    }
    
    // 添加编辑按钮事件
    document.querySelectorAll('.edit-location').forEach(button => {
        button.addEventListener('click', function() {
            const locationId = parseInt(this.getAttribute('data-id'));
            editLocation(locationId);
        });
    });
    
    // 添加删除按钮事件
    document.querySelectorAll('.delete-location').forEach(button => {
        button.addEventListener('click', function() {
            const locationId = parseInt(this.getAttribute('data-id'));
            deleteLocation(locationId);
        });
    });
}

/**
 * 添加地点管理事件监听器
 */
function addLocationEventListeners() {
    // 添加新地点按钮
    document.getElementById('add-location-btn').addEventListener('click', function() {
        // 设置表单标题
        document.getElementById('location-form-title').textContent = '添加新节点';
        
        // 清空表单
        document.getElementById('location-id').value = '';
        document.getElementById('location-name').value = '';
        document.getElementById('location-description').value = '';
        document.getElementById('location-category').value = '教学楼';
        document.getElementById('location-campus').value = 'west-north';
        document.getElementById('location-x').value = '500';
        document.getElementById('location-y').value = '400';
        
        // 显示表单
        document.getElementById('location-form-container').classList.remove('admin-hidden');
    });
    
    // 保存地点更改按钮
    document.getElementById('save-locations-btn').addEventListener('click', function() {
        saveLocationsChanges();
    });
    
    // 取消地点更改按钮
    document.getElementById('cancel-locations-btn').addEventListener('click', function() {
        cancelLocationsChanges();
    });
    
    // 取消地点表单按钮
    document.getElementById('cancel-location-form-btn').addEventListener('click', function() {
        document.getElementById('location-form-container').classList.add('admin-hidden');
    });
    
    // 地点表单提交
    document.getElementById('location-form').addEventListener('submit', function(event) {
        event.preventDefault();
        submitLocationForm();
    });
}

/**
 * 编辑地点
 * @param {number} locationId - 地点ID
 */
function editLocation(locationId) {
    // 查找地点
    const location = currentLocations.find(loc => loc.id === locationId);
    if (!location) return;
    
    // 设置表单标题
    document.getElementById('location-form-title').textContent = '编辑节点';
    
    // 填充表单
    document.getElementById('location-id').value = location.id;
    document.getElementById('location-name').value = location.name;
    document.getElementById('location-description').value = location.description || '';
    document.getElementById('location-category').value = location.category;
    document.getElementById('location-campus').value = location.campus;
    document.getElementById('location-x').value = location.x;
    document.getElementById('location-y').value = location.y;
    
    // 显示表单
    document.getElementById('location-form-container').classList.remove('admin-hidden');
}

/**
 * 删除地点
 * @param {number} locationId - 地点ID
 */
function deleteLocation(locationId) {
    // 确认删除
    if (!confirm(`确定要删除 ID 为 ${locationId} 的地点吗？\n注意：删除地点会同时删除与该地点相关的所有路径。`)) {
        return;
    }
    
    // 查找地点索引
    const index = currentLocations.findIndex(loc => loc.id === locationId);
    if (index === -1) return;
    
    // 删除地点
    currentLocations.splice(index, 1);
    
    // 删除相关路径
    currentPaths = currentPaths.filter(path => 
        path.sourceId !== locationId && path.targetId !== locationId
    );
    
    // 刷新表格
    refreshLocationTable();
    refreshPathTable();
    
    // 显示成功消息
    showAdminMessage('地点已删除', 'success');
}

/**
 * 提交地点表单
 */
function submitLocationForm() {
    // 获取表单数据
    const locationId = document.getElementById('location-id').value;
    const name = document.getElementById('location-name').value;
    const description = document.getElementById('location-description').value;
    const category = document.getElementById('location-category').value;
    const campus = document.getElementById('location-campus').value;
    const x = parseInt(document.getElementById('location-x').value);
    const y = parseInt(document.getElementById('location-y').value);
    
    // 验证数据
    if (!name || isNaN(x) || isNaN(y)) {
        showAdminMessage('请填写所有必填字段', 'error');
        return;
    }
    
    if (locationId) {
        // 更新现有地点
        const index = currentLocations.findIndex(loc => loc.id === parseInt(locationId));
        if (index !== -1) {
            currentLocations[index] = {
                ...currentLocations[index],
                name,
                description,
                category,
                campus,
                x,
                y
            };
            
            showAdminMessage('地点已更新', 'success');
        }
    } else {
        // 添加新地点
        const newId = maxLocationId + 1;
        maxLocationId = newId;
        
        currentLocations.push({
            id: newId,
            name,
            description,
            category,
            campus,
            x,
            y
        });
        
        showAdminMessage('新地点已添加', 'success');
    }
    
    // 刷新表格
    refreshLocationTable();
    
    // 隐藏表单
    document.getElementById('location-form-container').classList.add('admin-hidden');
}

/**
 * 保存地点更改
 */
function saveLocationsChanges() {
    // 确认保存
    if (!confirm('确定要保存对地点的所有更改吗？这将覆盖原始数据。')) {
        return;
    }
    
    // 保存到本地存储
    localStorage.setItem('campusLocations', JSON.stringify(currentLocations));
    
    // 更新原始数据
    originalLocations = JSON.parse(JSON.stringify(currentLocations));
    
    // 显示成功消息
    showAdminMessage('地点更改已保存', 'success');
    
    // 刷新地图（需要添加此功能）
    refreshMap();
}

/**
 * 取消地点更改
 */
function cancelLocationsChanges() {
    // 确认取消
    if (!confirm('确定要取消所有未保存的地点更改吗？这将恢复到上次保存的状态。')) {
        return;
    }
    
    // 恢复原始数据
    currentLocations = JSON.parse(JSON.stringify(originalLocations));
    
    // 刷新表格
    refreshLocationTable();
    
    // 显示消息
    showAdminMessage('地点更改已取消', 'success');
}

/**
 * 显示管理员消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 ('success' 或 'error')
 */
function showAdminMessage(message, type = 'success') {
    // 创建消息容器
    let messageContainer = document.getElementById('admin-message');
    
    // 如果容器不存在，创建一个
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'admin-message';
        messageContainer.className = `admin-${type}`;
        messageContainer.style.position = 'fixed';
        messageContainer.style.top = '20px';
        messageContainer.style.right = '20px';
        messageContainer.style.padding = '10px 20px';
        messageContainer.style.borderRadius = '4px';
        messageContainer.style.zIndex = '10000';
        document.body.appendChild(messageContainer);
    }
    
    // 设置消息内容和类型
    messageContainer.textContent = message;
    messageContainer.className = `admin-${type}`;
    
    // 3秒后自动隐藏
    setTimeout(() => {
        if (messageContainer.parentNode) {
            messageContainer.parentNode.removeChild(messageContainer);
        }
    }, 3000);
}

/**
 * 刷新地图
 * 这个函数将被实现为与现有地图渲染逻辑集成
 */
function refreshMap() {
    // 后续将添加与现有地图渲染逻辑的集成
    console.log('地图将被刷新');
}