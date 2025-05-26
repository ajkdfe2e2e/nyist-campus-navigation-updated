/**
 * 南阳理工学院校园导航系统
 * 管理员模式脚本 - 第3部分（路径管理功能）
 * 作者：杨博文（2415929683）
 */

/**
 * 刷新路径表格
 */
function refreshPathTable() {
    const tableBody = document.querySelector('#paths-table tbody');
    if (!tableBody) return;
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 添加路径行
    for (let i = 0; i < currentPaths.length; i++) {
        const path = currentPaths[i];
        
        // 获取起点和终点名称
        const sourceLocation = currentLocations.find(loc => loc.id === path.sourceId);
        const targetLocation = currentLocations.find(loc => loc.id === path.targetId);
        
        if (!sourceLocation || !targetLocation) continue;
        
        const row = document.createElement('tr');
        
        // 创建行内容
        row.innerHTML = `
            <td>${sourceLocation.name} (ID: ${path.sourceId})</td>
            <td>${targetLocation.name} (ID: ${path.targetId})</td>
            <td>${path.distance}</td>
            <td>${path.time}</td>
            <td class="admin-actions">
                <button class="admin-btn admin-btn-secondary edit-path" data-index="${i}">编辑</button>
                <button class="admin-btn admin-btn-danger delete-path" data-index="${i}">删除</button>
            </td>
        `;
        
        // 添加到表格
        tableBody.appendChild(row);
    }
    
    // 添加编辑按钮事件
    document.querySelectorAll('.edit-path').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            editPath(index);
        });
    });
    
    // 添加删除按钮事件
    document.querySelectorAll('.delete-path').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deletePath(index);
        });
    });
}

/**
 * 添加路径管理事件监听器
 */
function addPathEventListeners() {
    // 添加新路径按钮
    document.getElementById('add-path-btn').addEventListener('click', function() {
        // 设置表单标题
        document.getElementById('path-form-title').textContent = '添加新路径';
        
        // 清空表单
        document.getElementById('path-index').value = '';
        
        // 填充地点选择框
        populateLocationSelects();
        
        // 清空其他字段
        document.getElementById('path-distance').value = '100';
        document.getElementById('path-time').value = '1.5';
        
        // 显示表单
        document.getElementById('path-form-container').classList.remove('admin-hidden');
    });
    
    // 保存路径更改按钮
    document.getElementById('save-paths-btn').addEventListener('click', function() {
        savePathsChanges();
    });
    
    // 取消路径更改按钮
    document.getElementById('cancel-paths-btn').addEventListener('click', function() {
        cancelPathsChanges();
    });
    
    // 取消路径表单按钮
    document.getElementById('cancel-path-form-btn').addEventListener('click', function() {
        document.getElementById('path-form-container').classList.add('admin-hidden');
    });
    
    // 路径表单提交
    document.getElementById('path-form').addEventListener('submit', function(event) {
        event.preventDefault();
        submitPathForm();
    });
}

/**
 * 填充地点选择框
 */
function populateLocationSelects() {
    const sourceSelect = document.getElementById('path-source');
    const targetSelect = document.getElementById('path-target');
    
    if (!sourceSelect || !targetSelect) return;
    
    // 清空选择框
    sourceSelect.innerHTML = '';
    targetSelect.innerHTML = '';
    
    // 按校区和名称排序
    const sortedLocations = [...currentLocations].sort((a, b) => {
        if (a.campus !== b.campus) {
            return a.campus.localeCompare(b.campus);
        }
        return a.name.localeCompare(b.name);
    });
    
    // 创建校区分组
    const westNorthGroup = document.createElement('optgroup');
    westNorthGroup.label = '西北校区(北校区)';
    
    const eastSouthGroup = document.createElement('optgroup');
    eastSouthGroup.label = '东南校区(东校区)';
    
    // 添加地点选项
    for (const location of sortedLocations) {
        const option = document.createElement('option');
        option.value = location.id;
        option.textContent = `${location.name} (ID: ${location.id})`;
        
        // 添加到对应的分组
        if (location.campus === 'west-north') {
            westNorthGroup.appendChild(option.cloneNode(true));
        } else {
            eastSouthGroup.appendChild(option.cloneNode(true));
        }
    }
    
    // 添加分组到选择框
    if (westNorthGroup.hasChildNodes()) {
        sourceSelect.appendChild(westNorthGroup.cloneNode(true));
        targetSelect.appendChild(westNorthGroup.cloneNode(true));
    }
    
    if (eastSouthGroup.hasChildNodes()) {
        sourceSelect.appendChild(eastSouthGroup.cloneNode(true));
        targetSelect.appendChild(eastSouthGroup.cloneNode(true));
    }
}

/**
 * 编辑路径
 * @param {number} index - 路径索引
 */
function editPath(index) {
    // 检查索引有效性
    if (index < 0 || index >= currentPaths.length) return;
    
    const path = currentPaths[index];
    
    // 设置表单标题
    document.getElementById('path-form-title').textContent = '编辑路径';
    
    // 保存索引
    document.getElementById('path-index').value = index;
    
    // 填充地点选择框
    populateLocationSelects();
    
    // 设置选中的起点和终点
    document.getElementById('path-source').value = path.sourceId;
    document.getElementById('path-target').value = path.targetId;
    
    // 填充其他字段
    document.getElementById('path-distance').value = path.distance;
    document.getElementById('path-time').value = path.time;
    
    // 显示表单
    document.getElementById('path-form-container').classList.remove('admin-hidden');
}

/**
 * 删除路径
 * @param {number} index - 路径索引
 */
function deletePath(index) {
    // 检查索引有效性
    if (index < 0 || index >= currentPaths.length) return;
    
    // 确认删除
    if (!confirm('确定要删除这条路径吗？')) {
        return;
    }
    
    // 删除路径
    currentPaths.splice(index, 1);
    
    // 刷新表格
    refreshPathTable();
    
    // 显示成功消息
    showAdminMessage('路径已删除', 'success');
}

/**
 * 提交路径表单
 */
function submitPathForm() {
    // 获取表单数据
    const indexStr = document.getElementById('path-index').value;
    const sourceId = parseInt(document.getElementById('path-source').value);
    const targetId = parseInt(document.getElementById('path-target').value);
    const distance = parseInt(document.getElementById('path-distance').value);
    const time = parseFloat(document.getElementById('path-time').value);
    
    // 验证数据
    if (isNaN(sourceId) || isNaN(targetId) || isNaN(distance) || isNaN(time)) {
        showAdminMessage('请填写所有必填字段', 'error');
        return;
    }
    
    if (sourceId === targetId) {
        showAdminMessage('起点和终点不能相同', 'error');
        return;
    }
    
    if (distance <= 0 || time <= 0) {
        showAdminMessage('距离和时间必须大于0', 'error');
        return;
    }
    
    // 获取源和目标地点对象，以添加到路径中
    const source = { id: sourceId };
    const target = { id: targetId };
    
    // 检查路径是否已存在
    const existingPath = currentPaths.find(path => 
        (path.sourceId === sourceId && path.targetId === targetId) || 
        (path.sourceId === targetId && path.targetId === sourceId)
    );
    
    if (existingPath && (indexStr === '' || parseInt(indexStr) !== currentPaths.indexOf(existingPath))) {
        showAdminMessage('这两个地点之间的路径已存在', 'error');
        return;
    }
    
    // 构建路径对象
    const path = {
        sourceId,
        targetId,
        distance,
        time,
        source,
        target
    };
    
    if (indexStr !== '') {
        // 更新现有路径
        const index = parseInt(indexStr);
        if (index >= 0 && index < currentPaths.length) {
            currentPaths[index] = path;
            showAdminMessage('路径已更新', 'success');
        }
    } else {
        // 添加新路径
        currentPaths.push(path);
        showAdminMessage('新路径已添加', 'success');
    }
    
    // 刷新表格
    refreshPathTable();
    
    // 隐藏表单
    document.getElementById('path-form-container').classList.add('admin-hidden');
}

/**
 * 保存路径更改
 */
function savePathsChanges() {
    // 确认保存
    if (!confirm('确定要保存对路径的所有更改吗？这将覆盖原始数据。')) {
        return;
    }
    
    // 保存到本地存储
    localStorage.setItem('campusPaths', JSON.stringify(currentPaths));
    
    // 更新原始数据
    originalPaths = JSON.parse(JSON.stringify(currentPaths));
    
    // 显示成功消息
    showAdminMessage('路径更改已保存', 'success');
    
    // 刷新地图
    refreshMap();
}

/**
 * 取消路径更改
 */
function cancelPathsChanges() {
    // 确认取消
    if (!confirm('确定要取消所有未保存的路径更改吗？这将恢复到上次保存的状态。')) {
        return;
    }
    
    // 恢复原始数据
    currentPaths = JSON.parse(JSON.stringify(originalPaths));
    
    // 刷新表格
    refreshPathTable();
    
    // 显示消息
    showAdminMessage('路径更改已取消', 'success');
}