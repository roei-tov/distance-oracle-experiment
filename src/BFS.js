
class BFS {

    computeDistances(graph, source){
       return this._computeDistances(graph, source)[0]
    }

    getConnectedComponent(graph, source){
        return this._computeDistances(graph, source)[1]
    }

    _computeDistances(graph, source){
        let d = []
        let queue = new Queue()
        queue.enqueue({u: source, dist: 0})
        let covered = new Set()
        covered.add(source)
        while (queue.size){
            let {u, dist} = queue.dequeue()
            d[u] = dist
            let node = graph.getNode(u)
            for (const [w] of node.adjacentList) {
                if (!covered.has(w)){
                    covered.add(w)
                    queue.enqueue({u: w, dist: dist + 1})
                }
            }
        }
        queue.clear()

        return [d, covered]
    }
}

class Queue{
    constructor() {
        this.first = null
        this.last = null
        this.size = 0
    }

    enqueue(data){
        let node = {
            data,
            next: null
        }
        if (!this.last){
            this.first = this.last = node;
        } else {
            let last = this.last
            last.next = this.last = node
        }

        this.size++
    }

    dequeue(){
        if (!this.first)
            return null
        let first = this.first
        this.size--
        if (this.size == 0) {
            this.first = this.last = null
        } else {
            this.first = first.next
        }
        first.next = null
        return first.data
    }

    clear(){
        this.first = this.last = null
        this.size = 0
    }
}


module.exports = BFS