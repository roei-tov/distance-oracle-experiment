const Dijkstra = require("./Dijkstra");
const BFS = require("./BFS");
const UndirectedGraph = require("./UndirectedGraph");
const { workerData, parentPort } = require('worker_threads');
let {id, batch, graphData} = workerData.value
let algorithm = graphData.isWeighted ? new Dijkstra() : new BFS()
let graph = new UndirectedGraph(graphData.edges, graphData.isWeighted)  // reconstruct graph data structure
let distancesMap = {}
let counter = 0
for (const nodeId of batch) {
    distancesMap[nodeId] = algorithm.computeDistances(graph, nodeId)
    counter++
    // console.log('Worker-' + id, `${counter} / ${batch.length}`)
}
// console.log(node.id, graph.getNode)
parentPort.postMessage({id, batch, distancesMap})