
Math.roundWithPrecision = function(num, dec) {
    return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
}

class ThorupZwickDO {

    constructor(graph, distanceMatrix, k) {
        this.k = k
        this.distanceMatrix = distanceMatrix
        this.constructDO(graph, distanceMatrix, k)
    }

    constructDO(graph, distanceMatrix, k){
        let nodes = graph.getNodesIds()
        let nodesData = nodes.map(u =>
            ({
                vertex: u,
                pivots:[{node: u, distance: 0}],
                bunches: [],
                bunchDistances: {}
            })
        )
        let samples = []
        samples.push(graph.getNodesIds())
        let p = Math.pow(graph.n, - 1 / k)
        for (let i = 1; i < k; i++) {
            let prevSample = samples[i - 1]
            let sample = []
            for (const node of prevSample) {
                if (Math.random() < p)
                    sample.push(node)
            }
            // console.log('Sample length', sample)
            samples.push(sample)
        }
        samples.push([]) // A_k = empty set
        for (const nodeData of nodesData) {
            let bunch = []
            for (let i = 1; i <= k; i++) {
                let {node, distance} = this.getClosestPivot(nodeData.vertex, samples[i], distanceMatrix)
                nodeData.pivots.push({node, distance, averageDistance: i < k ? distance / i : null})
                let prevSample = samples[i - 1]
                let bunch_i = this.getBunchOfSample(nodeData.vertex, distance, prevSample, distanceMatrix)
                for (const v of bunch_i) {
                    nodeData.bunchDistances[v] = distanceMatrix.getDistance(nodeData.vertex, v)
                }
                nodeData.bunches.push(new Set(bunch_i))
                bunch = bunch.concat(bunch_i)
            }
            // bunch = bunch.concat(samples[k - 1])    // since A_k == empty set, we take A_{k-1} as is
            // nodeData.bunches.push(new Set(samples[k - 1]))
            for (const v of bunch) {
                nodeData.bunchDistances[v] = distanceMatrix.getDistance(nodeData.vertex, v)
            }
            // bunch = new Set(bunch.concat())
        }
        this.nodesDataMap = new Map(nodesData.map(nodeData => [nodeData.vertex, nodeData]))
    }

    getDistance(u, v){
        let i = 0
        let nodeDataVertex1 = this.nodesDataMap.get(u)
        let nodeDataVertex2 = this.nodesDataMap.get(v)
        while (!nodeDataVertex2.bunches[i].has(nodeDataVertex1.pivots[i].node)){
            i++
            [nodeDataVertex1, nodeDataVertex2] = [nodeDataVertex2, nodeDataVertex1] //  swap
        }
        let pivot = nodeDataVertex1.pivots[i]
        return pivot.distance + nodeDataVertex2.bunchDistances[pivot.node]
    }

    getBunchOfSample(u, d, sample, distanceMatrix){
        let bunch = []
        for (const v of sample) {
            if (distanceMatrix.getDistance(u, v) < d) {
                bunch.push(v)
            }
        }
        return bunch
    }

    getClosestPivot(u, sample, distanceMatrix){
        let distance = Number.MAX_SAFE_INTEGER
        let node = null
        for (const v of sample) {
            let d = distanceMatrix.getDistance(u, v)
            if (d < distance || (d == distance && (node == null || v < node))) {    // ties breaks by id natural order
                distance = d
                node = v
            }
        }
        return {distance, node}
    }

    computeStats(){
        let distanceMatrix = this.distanceMatrix
        let graph = distanceMatrix.graph
        let property9Count = 0
        let property10Count = 0
        let property11Count = 0
        let anyPropertyCount = 0
        let nonPropertyCount = 0
        /*        for (const nodeData of this.nodesDataMap.values()) {

                }*/

        let nodes = distanceMatrix.graph.getNodes()
        let exactCount = 0
        let worstCaseCount = 0
        let ratioSum = 0
        let propertiesRatioSum = 0
        let notPropertiesRatioSum = 0
        for (const u of nodes) {
            let pivots1 = this.nodesDataMap.get(u.id).pivots
            let averageDistances = pivots1.filter(pivot => pivot.averageDistance != null).map(pivot => pivot.averageDistance)
            let len = averageDistances.length
            let setLen = new Set(averageDistances).size
            let foundProperty9 = false
            if (setLen < len) {
                // console.log('ASASD',graph.getNode(u.id).adjacentList.length)
                property9Count += graph.n
                foundProperty9 = true
            }
            for (const v of nodes) {
                let pivots2 = this.nodesDataMap.get(v.id).pivots
                let foundProperty10 = false
                let foundProperty11 = false
                for (let i = 1; i < this.k; i++) {
                    if (pivots1[i].averageDistance != pivots2[i].averageDistance){
                        if (!foundProperty10) {
                            property10Count++
                            foundProperty10 = true
                        }
                        break
                    } else {
                        let q = pivots1[i].averageDistance
                        if (distanceMatrix.getDistance(u.id, v.id) != q && !foundProperty11) {
                            foundProperty11 = true
                            property11Count++
                        }
                    }
                }
                let exact = distanceMatrix.getDistance(u.id, v.id)
                let stretched = this.getDistance(u.id, v.id)
                let ratio = exact != 0 ? stretched / exact : 1
                // console.log(ratio)
                ratioSum += ratio
                if (exact != stretched){
                    if (stretched == exact * (2 * this.k - 1)){
                        worstCaseCount++
                    }
                } else {
                    exactCount++
                }
                if (foundProperty9 || foundProperty10 || foundProperty11){
                    anyPropertyCount++
                    propertiesRatioSum += ratio
                    if (!ratio) {
                        let exact = distanceMatrix.getDistance(u.id, v.id)
                        let stretched = this.getDistance(u.id, v.id)
                        console.log(exact, stretched, u.id, v.id)
                        return
                    }

                } else {
                    nonPropertyCount++
                    notPropertiesRatioSum += ratio
                }
            }
        }
        let nxn = graph.n * graph.n
        console.log(`Property 9 holds for ${Math.roundWithPrecision(100 * property9Count / nxn, 2)}%`)
        console.log(`Property 10 holds for ${Math.roundWithPrecision(100 * property10Count / nxn, 2)}%`)
        console.log(`Property 11 holds for ${Math.roundWithPrecision(100 * property11Count / nxn, 2)}%`)
        console.log(`One of the properties hold for ${Math.roundWithPrecision(100 * anyPropertyCount / nxn, 2)}%`)
        console.log(`Exact Percentage: ${Math.roundWithPrecision(100 * exactCount / nxn, 2)}%`)
        console.log(`Worst Case Percentage: ${Math.roundWithPrecision(100 * worstCaseCount / nxn, 2)}%`)
        console.log(`Average Stretch when properties hold: ${Math.roundWithPrecision(propertiesRatioSum / anyPropertyCount, 2)}`)
        console.log(`Average Stretch when properties don't hold: ${nonPropertyCount ? Math.roundWithPrecision(notPropertiesRatioSum / nonPropertyCount, 2) : '-'}`)
        console.log(`Average Stretch: ${Math.roundWithPrecision(ratioSum / nxn, 2)}`)
    }
}

module.exports = ThorupZwickDO