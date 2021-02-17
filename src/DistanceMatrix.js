const Dijkstra = require("./Dijkstra");
const BFS = require("./BFS");
const UndirectedGraph = require("./UndirectedGraph");

class DistanceMatrix {

    constructor() {
        this.dist = {}
    }

    buildDistanceMatrix(graph){
        let start = process.hrtime()
        this.graph = graph
        let nodes = graph.getNodes()
        let dist = this.dist
        let algorithm = graph.isWeighted ? new Dijkstra() : new BFS()
        for (const node of nodes) {
            // console.log(node.id)
            // console.log(node.id,  algorithm.computeDistances(graph, node.id))
            dist[node.id] = algorithm.computeDistances(graph, node.id)
        }
        let hrend = process.hrtime(start)
        console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
        return this
    }

    setDistancesOfVertex(id, arr){
        this.dist[Number(id)] = arr
    }

    buildDistanceMatrixMultiCore(graph, numOfWorkers = 16, maxBatchSize = Math.round(graph.getNodes().length / numOfWorkers)){
        let start = process.hrtime()
        this.graph = graph
        let dist = this.dist = this.createEmptyDistanceMatrix(graph.getNodes().length)
        return new Promise((resolve) => {
            let nodes = graph.getNodes().slice().reverse()
            let progress = 0
            let nodesLen = nodes.length

            let callback = (result) => {
                progress += result.batch.length
                for (const nodeId in result.distancesMap) {
                    let arr = dist[nodeId]
                    // console.log(nodeId, arr.length)
                    let origArr = result.distancesMap[nodeId]
                    // console.log('origArr', arr.length, origArr.length)
                    for (let i = 0; i < nodeId; i++) {
                        arr[i] = origArr[i]
                    }
                    // console.log('origArr', arr)
                }
                if (progress == nodesLen){
                    // staticPool.destroy()
                    let hrend = process.hrtime(start)
                    console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
                    resolve(this)
                } else {
                    this.assignWorker(nodes, graph, maxBatchSize, callback)
                }
                console.log("result from thread pool:", result.id, result.batch.length, progress);
            }

            for (let i = 0; i < numOfWorkers; i++) {
                this.assignWorker(nodes, graph, maxBatchSize, callback)
            }
        })
    }

    createEmptyDistanceMatrix(numberOfNodes){
        let distanceMatrix = new Array(numberOfNodes)
        for (let i = 0; i < numberOfNodes; i++) {
            distanceMatrix[i] = numberOfNodes < 65535 ? new Uint16Array(i) : new Uint32Array(i)
        }
        return distanceMatrix
    }

    assignWorker(nodesQueue, graph, maxBatchSize, callback){
        if (!nodesQueue.length)
            return
        console.log('Queue size', nodesQueue.length)
        let counter = 0
        let batch = []
        let id
        while (++counter <= maxBatchSize && nodesQueue.length) {
            let node = nodesQueue.pop()
            if (counter == 1)
                id = node.id
            batch.push(node.id)
        }
        const {Worker} = require('worker_threads')
        const worker = new Worker('./ComputeBatchWorker.js', { workerData: {value: {id, batch, graphData: graph}} })
        worker.on('message', (result) => {
            callback(result)
            worker.terminate()
        });
        worker.on( "error", err => console.error( "error", id, err ) );

        worker.on('exit', (code) => {
            if (code !== 0)
                throw new Error(`Worker stopped with exit code ${code}`);
            else
                console.log('Worker stopped ' + code);
        })
    }

/*
    toStringifyObject(){
        return JSON.stringify({
            graphEdges: this.graph.edges,
            dist: this.dist,
        })
    }
*/

    static fromStringifyObject(str){
        let {graphEdges, dist} = JSON.parse(str)
        let distanceMatrix = new DistanceMatrix()
        distanceMatrix.graph = new UndirectedGraph(graphEdges)
        distanceMatrix.dist = dist
        return distanceMatrix
    }

    getDistance(u, v){
        // console.log(u, v)
        if (u == v)
            return 0
        return u > v ? this.dist[u][v] : this.dist[v][u]
    }

    getDiameter(){
        let nodes = this.graph.getNodes()
        let max = 0
        let umax= null
        let vmax= null
        for (const u of nodes) {
            for (const v of nodes) {
                let d = this.getDistance(u.id, v.id)
                if (u != v && d ==0)
                    console.log(u.id, v.id, d)
                if (d > max){
                    max = d
                    umax = u
                    vmax = v
                }
            }
        }
        console.log(umax.id, vmax.id)
        return max
    }
}

module.exports = DistanceMatrix