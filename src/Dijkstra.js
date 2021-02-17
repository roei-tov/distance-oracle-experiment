
// const PriorityQueue = require('./PriorityQueue')

class Dijkstra {
    computeDistances(graph, source){
        let d = {}
        let nodes = graph.getNodes()
        let queue = new PriorityQueue()
        for (const node of nodes) {
            let nodeId = node.id
            d[nodeId] = nodeId == source ? 0 : Number.MAX_SAFE_INTEGER
            queue.enqueue({id: nodeId, key: d[nodeId]})
        }

        while (!queue.isEmpty()) {
            // console.log(queue.getSize())
            let v = queue.dequeue().id
            let node = graph.nodes[v]
            for (const [w, weight] of node.adjacentList) {
                if (d[w] > d[v] + weight){
                    d[w] = d[v] + weight
                    queue.decreaseKey(w, d[w])
                }
            }
        }
        return d
    }
}


/*
class PriorityQueue1 {   // naive now, later based it on binary heap
    constructor() {
        this.list = []
    }

    isEmpty(){
        return this.list.length == 0
    }

    getSize(){
        return this.list.length
    }

    enqueue(element, priority){
        this.list.push({priority, element})
    }

    dequeue(){
        let min = Number.MAX_SAFE_INTEGER
        let minElement = null
        let ind = 0
        for (let i = 0; i < this.list.length; i++) {
            const {priority, element} = this.list[i]
            if (priority < min) {
                min = priority
                minElement = element
                ind = i
            }
        }
        this.list.splice(ind, 1)
        return {priority: min, element: minElement}
    }

    decreaseKey(element, key){
        for (const curr of this.list) {
            if (curr.element == element){
                curr.priority = key
            }
        }
    }
}
*/

class PriorityQueue {

    static testPriorityQueue(){
        let pq = new PriorityQueue()
        pq.enqueue({id: 1, key: 15})
        pq.enqueue({id: 2, key: 10})
        pq.enqueue({id: 3, key: 12})
        pq.enqueue({id: 4, key: 8})
        pq.enqueue({id: 5, key: 5})
        pq.enqueue({id: 6, key: 88})
        pq.enqueue({id: 7, key: 32})
        pq.decreaseKey(3, 2)
        pq.enqueue({id: 8, key: 4})
        pq.enqueue({id: 9, key: 22})
        pq.decreaseKey(6, 9)
        pq.enqueue({id: 10, key: 13})
        pq.enqueue({id: 11, key: 28})
        while (!pq.isEmpty()){
            console.log(pq.dequeue())
        }
    }

    constructor() {
        this.lastIndex = 0
        this.size = 0
        this.array = []
        this.elementsToIndexMap = new Map()
    }

    isEmpty(){
        return this.size == 0
    }

    enqueue(element){
        this.size++
        this.array[this.size] = element
        this.elementsToIndexMap.set(element.id, this.size)
        this.heapifyUp(this.size)
    }

    dequeue(){
        if (this.size){
            let min = this.array[1]
            this.swap(1, this.size)
            delete this.array[this.size]
            this.elementsToIndexMap.delete(min.id)
            this.size--
            this.heapifyDown(1)

            return min
        }
        return null
    }

    decreaseKey(id, key){
        let ind = this.elementsToIndexMap.get(id)
        this.array[ind].key = key
        this.heapifyUp(ind)
    }

    heapifyDown(i){
        let arr = this.array
        let left = 2 * i
        let right = 2 * i + 1
        let smallest = i
        if (left <= this.size && arr[left].key < arr[smallest].key){
            smallest = left
        }
        if (right <= this.size && arr[right].key < arr[smallest].key){
            smallest = right
        }
        if (smallest != i) {
            this.swap(smallest, i)
            this.heapifyDown(smallest)
        }
    }

    heapifyUp(i){
        let arr = this.array
        let parent = Math.floor(i / 2)
        if (parent >= 1){
            let child = i
            if (arr[child].key < arr[parent].key){
                this.swap(parent, child)
                this.heapifyUp(parent)
            }
        }
    }

    swap(i, j){
        let temp = this.array[i]
        this.array[i] = this.array[j]
        this.array[j] = temp
        this.elementsToIndexMap.set(this.array[i].id, j)
        this.elementsToIndexMap.set(this.array[j].id, i)
    }
}

// PriorityQueue.testPriorityQueue()


module.exports = Dijkstra