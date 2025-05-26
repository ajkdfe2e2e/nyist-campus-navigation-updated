/**
 * 南阳理工学院校园导航系统
 * 路径查找算法
 * 作者：杨博文（2415929683）
 * 完成日期：2025.5.20
 */

/**
 * Dijkstra最短路径算法
 * @param {Object} graph - 图结构，包含顶点和邻接表
 * @param {number} startVertex - 起点ID
 * @param {number} endVertex - 终点ID
 * @param {string} weightType - 权重类型，'distance'表示距离，'time'表示时间
 * @returns {Object} 包含路径、总距离和总时间的结果对象
 */
function findShortestPath(graph, startVertex, endVertex, weightType = 'distance') {
    // 初始化距离表、前驱节点表和已访问集合
    const distances = {};
    const previous = {};
    const visited = new Set();
    
    // 初始化所有顶点的距离为Infinity
    for (let vertex of graph.vertices) {
        distances[vertex] = Infinity;
        previous[vertex] = null;
    }
    
    // 起点距离为0
    distances[startVertex] = 0;
    
    // 当未访问集合不为空时
    while (graph.vertices.length > visited.size) {
        // 获取未访问顶点中距离最小的顶点
        let current = findMinDistanceVertex(distances, visited);
        
        // 如果当前顶点不存在或已到达终点，结束算法
        if (current === null || current === endVertex) break;
        
        // 标记为已访问
        visited.add(current);
        
        // 更新相邻顶点的距离
        for (let neighbor of graph.adjacencyList[current]) {
            // 如果相邻顶点已访问，跳过
            if (visited.has(neighbor.vertex)) continue;
            
            // 计算从当前顶点经过相邻顶点的新距离
            const weight = weightType === 'distance' ? neighbor.distance : neighbor.time;
            const newDistance = distances[current] + weight;
            
            // 如果新距离更短，更新距离和前驱节点
            if (newDistance < distances[neighbor.vertex]) {
                distances[neighbor.vertex] = newDistance;
                previous[neighbor.vertex] = current;
            }
        }
    }
    
    // 构建路径
    const path = [];
    let current = endVertex;
    
    // 如果终点不可达，返回空路径
    if (distances[endVertex] === Infinity) {
        return {
            path: [],
            totalDistance: 0,
            totalTime: 0
        };
    }
    
    // 沿着前驱节点回溯构建路径
    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }
    
    // 计算总距离和总时间
    const totalResult = calculatePathTotal(graph, path);
    
    return {
        path: path,
        totalDistance: totalResult.totalDistance,
        totalTime: totalResult.totalTime
    };
}

/**
 * 从未访问集合中找到距离最小的顶点
 * @param {Object} distances - 距离表
 * @param {Set} visited - 已访问集合
 * @returns {number|null} 距离最小的顶点ID，如果所有顶点都已访问则返回null
 */
function findMinDistanceVertex(distances, visited) {
    let minDistance = Infinity;
    let minVertex = null;
    
    // 遍历所有顶点
    for (let vertex in distances) {
        vertex = parseInt(vertex);
        
        // 如果顶点未访问且距离更小，更新最小距离顶点
        if (!visited.has(vertex) && distances[vertex] < minDistance) {
            minDistance = distances[vertex];
            minVertex = vertex;
        }
    }
    
    return minVertex;
}

/**
 * 计算路径的总距离和总时间
 * @param {Object} graph - 图结构
 * @param {Array} path - 路径顶点数组
 * @returns {Object} 包含总距离和总时间的对象
 */
function calculatePathTotal(graph, path) {
    let totalDistance = 0;
    let totalTime = 0;
    
    // 遍历路径中的每一段
    for (let i = 0; i < path.length - 1; i++) {
        const current = path[i];
        const next = path[i + 1];
        
        // 在邻接表中查找这一段的距离和时间
        const edge = graph.adjacencyList[current].find(edge => edge.vertex === next);
        
        if (edge) {
            totalDistance += edge.distance;
            totalTime += edge.time;
        }
    }
    
    return {
        totalDistance,
        totalTime
    };
}

/**
 * 查找多条可能路径
 * @param {Object} graph - 图结构
 * @param {number} startVertex - 起点ID
 * @param {number} endVertex - 终点ID
 * @param {number} maxPaths - 最大路径数量
 * @returns {Array} 包含多条路径信息的数组
 */
function findMultiplePaths(graph, startVertex, endVertex, maxPaths = 3) {
    // 使用BFS查找多条路径
    const pathsFound = [];
    const queue = [];
    
    // 将起点加入队列
    queue.push({
        path: [startVertex],
        visited: new Set([startVertex])
    });
    
    while (queue.length > 0 && pathsFound.length < maxPaths) {
        const { path, visited } = queue.shift();
        const current = path[path.length - 1];
        
        // 如果到达终点，保存路径
        if (current === endVertex) {
            const result = calculatePathTotal(graph, path);
            pathsFound.push({
                path: path,
                totalDistance: result.totalDistance,
                totalTime: result.totalTime
            });
            continue;
        }
        
        // 遍历当前顶点的所有邻居
        for (let neighbor of graph.adjacencyList[current]) {
            if (!visited.has(neighbor.vertex)) {
                // 创建新的访问集合和路径
                const newVisited = new Set(visited);
                newVisited.add(neighbor.vertex);
                const newPath = [...path, neighbor.vertex];
                
                // 将新状态加入队列
                queue.push({
                    path: newPath,
                    visited: newVisited
                });
            }
        }
    }
    
    // 按总距离排序
    pathsFound.sort((a, b) => a.totalDistance - b.totalDistance);
    
    return pathsFound;
}

// 导出模块
const PathFinding = {
    findShortestPath,
    findMultiplePaths
}; 