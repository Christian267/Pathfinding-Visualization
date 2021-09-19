export function depthFirstSearch(grid, startNode) {
    const visitedNodesInOrder = [];
    const allVisitedNodes = [];
    allVisitedNodes.push(...processNode(startNode, grid));
    for (const node of allVisitedNodes){
        visitedNodesInOrder.push(node);
        if (node.isFinish) return visitedNodesInOrder;
    }
    return visitedNodesInOrder;
}

function processNode(node, grid) {
    if (node.isFinish) return [node];
    const visitedNodesInOrder = [];
    node.isVisited = true;
    const neighbors = getUnvisitedNeighbors(node, grid);
    if (neighbors.length === 0) {
        visitedNodesInOrder.push(node);
        return visitedNodesInOrder;
    }
    while (neighbors.length > 0) {
        const randomIndex = Math.floor(Math.random() * neighbors.length);
        const neighbor = neighbors.splice(randomIndex, 1)[0];
        if (neighbor.previousNode === null) neighbor.previousNode = node;
        const newNodes = processNode(neighbor, grid);
        for (const newNode of newNodes) {
            if(!visitedNodesInOrder.includes(newNode)) {
                visitedNodesInOrder.push(newNode);
            }
        }
    }
    visitedNodesInOrder.unshift(node);
    return visitedNodesInOrder;
}

export function getNodesInShortestPathOrder(finishNode) {
    const nodesInShortestPath = [];
    let currentNode = finishNode;
    while (currentNode !== null) {
        nodesInShortestPath.unshift(currentNode);
        currentNode = currentNode.previousNode;
    }
    return nodesInShortestPath;
}
function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const { col, row } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    const viableNeighbors = neighbors.filter((neighbor) => !(neighbor.isVisited || neighbor.isWall));
    return viableNeighbors;
}
