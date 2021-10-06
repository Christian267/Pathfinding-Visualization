export function breadthFirstSearch(grid, startNode, finishNode){
    const queue = [startNode];
    const visitedNodesInOrder = [];
    while (queue.length > 0) {
        console.log("Current Queue: " + queue)
        const currentNode = queue.shift();
        console.log("Current Node: " + currentNode);
        currentNode.isVisited = true;
        visitedNodesInOrder.push(currentNode);
        const neighbors = getUnvisitedNeighbors(currentNode, grid);
        console.log("Current Neighbors: " + neighbors);
        for (const neighbor of neighbors) { 
            if (!queue.includes(neighbor)) {
                console.log("Neighbor: " + neighbor);
                neighbor.previousNode = currentNode;
                queue.push(neighbor);
            }
        }
        if (currentNode == finishNode) { 
            return visitedNodesInOrder;
        }
    }
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