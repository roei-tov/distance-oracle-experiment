
class UndirectedGraph {

    constructor(edges, isWeighted = false) {
        this.isWeighted = isWeighted
        let nodes = this.nodes = {}

        this.n = 0
        this.m = 0
        this.edges = []
        let edgesSet = new Set()
        for (let [u, v, weight = 1] of edges) {
            u = Number(u)
            v = Number(v)
            let key = u < v ? u +'@' + v : v + '@' + u
            if (edgesSet.has(key))
                continue
            edgesSet.add(key)
            this.edges.push([u, v, weight])
            let node1 = nodes[u]
            if (!node1) {
                node1 = {
                    id: u,
                    adjacentList: []
                }
                nodes[u] = node1
                this.n++
            }
            let node2 = nodes[v]
            if (!node2) {
                node2 = {
                    id: v,
                    adjacentList: []
                }
                nodes[v] = node2
                this.n++
            }
            node1.adjacentList.push([v, weight])
            node2.adjacentList.push([u, weight])
            this.m++
        }
        let nodesArr = this.nodesArr = []
        let nodesIdsArr = this.nodesIdsArr = []
        for (const nodeId in nodes) {
            nodesArr.push(nodes[nodeId])
            nodesIdsArr.push(Number(nodeId))
        }
    }

    getNode(u){
        return this.nodes[u]
    }

    getNodes(){
        return this.nodesArr
    }

    getNodesIds(){
        return this.nodesIdsArr
    }
}

module.exports = UndirectedGraph