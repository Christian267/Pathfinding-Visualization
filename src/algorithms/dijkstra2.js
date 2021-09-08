import PriorityQueue from "./PriorityQueue";

export function dijkstra(grid, startNode, finishNode) {
    const queue = new PriorityQueue();
    startNode.distance = 1000;
    const visitedNodesInOrder = [];
    const neighborsAlreadyInQueue = [];
    queue.push([startNode, startNode.distance]);
    while (!queue.isEmpty()) {
        const currentNode = queue.pop()[0];
        currentNode.isVisited = true;
        visitedNodesInOrder.push(currentNode);
        const currentViableNeighbors = getUnvisitedNeighbors(currentNode, grid);
        for (const neighbor of currentViableNeighbors) {
            if (!(neighborsAlreadyInQueue.includes(neighbor))){
                updateNeighbors(neighbor, currentNode);
                neighborsAlreadyInQueue.push(neighbor);
                queue.push([neighbor, neighbor.distance]);
            }
        }
        if (currentNode === finishNode) {
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
    // for (const neighbor of neighbors) {
    //     console.log("Inside getUnvisitedNeighbors(); neighbors: " + neighbor.isVisited);
    // }
    // for (const neighbor of viableNeighbors) {
    //     console.log("ROW: " + neighbor.row + ", COL: " + neighbor.col);
    // }
    return viableNeighbors;
}

function updateNeighbors(neighbor, node) {
    neighbor.distance = node.distance + neighbor.weight;
    neighbor.previousNode = node;
    
}