export function mazeAlgorithm(grid, startNode) {
    const visitedNodesInOrder = [];
    visitedNodesInOrder.push(...processNode(startNode, grid));
    return visitedNodesInOrder;
}

function processNode(node, grid) {
    const visitedNodesInOrder = [];
    node.isWall = true;
    const neighbors = getUnvisitedNeighbors(node, grid);
    if (neighbors.length === 0) {
        visitedNodesInOrder.push(node);
        return visitedNodesInOrder;
    }
    while (neighbors.length > 0) {
        const randomIndex = Math.floor(Math.random() * neighbors.length);
        const neighbor = neighbors.splice(randomIndex, 1)[0];
        const newNodes = processNode(neighbor, grid);
        for (const newNode of newNodes) {
            if(!visitedNodesInOrder.includes(newNode)) visitedNodesInOrder.push(newNode);
        }
    }
    visitedNodesInOrder.unshift(node);
    return visitedNodesInOrder;
}

function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const { col, row } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    const viableNeighbors = neighbors.filter((neighbor) => !(neighbor.isWall));
    return viableNeighbors;
}
