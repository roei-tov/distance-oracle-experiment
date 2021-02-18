
const fs = require('fs')
const UndirectedGraph = require("./UndirectedGraph");
const DistanceMatrix = require("./DistanceMatrix");
const ThorupZwickDO = require("./ThorupZwickDO");
const MongoDB = require("./MongoDB");
const BFS = require("./BFS");

class DistanceOracleExperiment {

    constructor() {
        let parser1 = data => data.split('\n').map(line => line.trim()).filter(line => line.length).map(line => line.split(' ').map(v => Number(v)))
        let parser2 = data => data.split('\n').map(line => line.trim()).filter(line => line.length).map(line => line.split(',').map(v => Number(v)))
        let parser3 = data => data.split('\n').map(line => line.trim()).filter(line => line.length).map(line => line.split('\t').map(v => Number(v)))
        this.experiments = {
            egoFacebook: {
                name: 'Ego Facebook',
                datasetLocation: 'social/EgoFacebook.txt',
                targetStoreName: 'EgoFacebookDistances',
                workers: {
                    number:8,
                    batchSize: 500
                },
                relabelNodes: false,
                largestComponentNodeId: null,
                parser: parser1
            },
            deezerHRs: {
                name: 'Ego Facebook',
                datasetLocation: 'social/DeezerHRs.csv',
                targetStoreName: 'Deezer_HRDistances',
                workers: {
                    number:8,
                    batchSize: 500
                },
                parser: parser2
            },
            CAGrQc: {
                name: 'CAGrQc',
                datasetLocation: 'collaboration/CA-GrQc.txt',
                targetStoreName: 'CAGrQc',
                workers: {
                    number:8,
                    batchSize: 500
                },
                relabelNodes: true,
                largestComponentNodeId: 2,
                parser: parser3
            },
            CAHepTh: {
                name: 'CAHepTh',
                datasetLocation: 'collaboration/CA-HepTh.txt',
                targetStoreName: 'CAHepTh',
                workers: {
                    number:8,
                    batchSize: 500
                },
                relabelNodes: true,
                largestComponentNodeId: 0,
                parser: parser3
            },
            emailEnron: {
                name: 'EmailEnron',
                datasetLocation: 'communication/EmailEnron.txt',
                targetStoreName: 'EmailEnron',
                workers: {
                    number:8,
                    batchSize: 500
                },
                relabelNodes: true,
                largestComponentNodeId: 0,
                parser: parser3
            },
            oregon2_010331: {
                name: 'oregon2_010331',
                datasetLocation: 'AS/oregon2_010331.txt',
                targetStoreName: 'oregon2_010331',
                relabelNodes: true,
                workers: {
                    number:8,
                    batchSize: 500
                },
                parser: parser3
            },
            twitch_DE: {
                name: 'Twitch DE',
                datasetLocation: 'social/twitch_DE_edges.csv',
                targetStoreName: 'twitch_DE',
                relabelNodes: true,
                workers: {
                    number:8,
                    batchSize: 500
                },
                parser: parser2
            },
            fb_pages_new_sites: {
                name: 'Facebook New Sites Pages',
                datasetLocation: 'social/fb_pages_new_sites_edges.csv',
                targetStoreName: 'fb_pages_new_sites',
                relabelNodes: true,
                workers: {
                    number:8,
                    batchSize: 500
                },
                parser: parser2
            },
            fb_pages_artist: {
                name: 'Facebook Artist Pages',
                datasetLocation: 'social/fb_pages_artist_edges.csv',
                targetStoreName: 'fb_pages_artist',
                relabelNodes: true,
                workers: {
                    number:8,
                    batchSize: 1000
                },
                parser: parser2
            },
            github: {
                name: 'Github',
                datasetLocation: 'social/git_edges.csv',
                targetStoreName: 'github',
                relabelNodes: true,
                workers: {
                    number:8,
                    batchSize: 500
                },
                parser: parser2
            },
        }
    }

    async run(){
        let config = this.experiments.github
        // let graph = this.readGraph(config)
        // console.log(graph.n)
        // console.log(graph.m)
        // let covered = new BFS().getConnectedComponent(graph, 0)
        // console.log(covered.size)
        // return
        // await this.storeGraphDistances(config)
        // return
        // let distanceMatrix
        // distanceMatrix = await this.restoreDistanceMatrixFromDB(config)
        // console.log(distanceMatrix.getDiameter())
        await this.runDistanceOracleExperiment(config)
    }

    readGraph(config){
        const data = fs.readFileSync(`../datasets/${config.datasetLocation}`, {encoding:'utf8', flag:'r'})
        let edges = config.parser(data)
        if (config.relabelNodes){
            edges = this.relabelAsSequence(edges)
        }
        let graph = new UndirectedGraph(edges, false)
        if (config.largestComponentNodeId != null){
            let covered = new BFS().getConnectedComponent(graph, config.largestComponentNodeId)
            let newEdges = []
            for (const [u,v] of edges) {
                if (covered.has(u)){
                    newEdges.push([u,v])
                }
            }
            newEdges = this.relabelAsSequence(newEdges)
            graph = new UndirectedGraph(newEdges, false)
        }

        return graph
    }

    async storeGraphDistances(config){
        let graph = this.readGraph(config)
        let distanceMatrix = await new DistanceMatrix().buildDistanceMatrixMultiCore(graph, config.workers.number, config.workers.batchSize)
        await this.storeDistanceMatrixInDB(distanceMatrix, config.targetStoreName)
        return distanceMatrix
    }

    async runDistanceOracleExperiment(config, dm){
        let distanceMatrix = dm || await this.restoreDistanceMatrixFromDB(config)
        console.log('--------------------')
        console.log(`${config.name} Network`)
        console.log('--------------------')
        console.log('Number of Nodes', distanceMatrix.graph.n)
        console.log('Number of Edges', distanceMatrix.graph.m)
        let ks = [2, 3, 5, 10]
        // let ks = [3]
        for (const k of ks) {
            console.log('==============================================')
            console.log('Results for k='+k)
            console.log('---------------------')
            let tzdo = new ThorupZwickDO(distanceMatrix.graph, distanceMatrix, k)
            tzdo.computeStats()
            console.log('==============================================')
            console.log()
        }
    }


    relabelAsSequence(edges){
        let nodesSet = new Set()
        for (const [u, v] of edges) {
            nodesSet.add(u)
            nodesSet.add(v)
        }
        let nodesIds = [...nodesSet]
        nodesIds.sort((n1, n2) => n1 - n2)
        let map = new Map()
        for (let i = 0; i < nodesIds.length; i++) {
            map.set(nodesIds[i], i)
        }
        let newEdges = []
        for (const [u, v] of edges) {
            newEdges.push([map.get(u), map.get(v)])
        }
        return newEdges
    }

    async storeDistanceMatrixInDB(distanceMatrix, datasetName){
        await MongoDB.connectDB()
        let collection = MongoDB.getCollection(datasetName)
        collection.createIndex({nodeId: 1})
        let numOfNodes = distanceMatrix.graph.n
        let dist = distanceMatrix.dist
        let to = 0
        while (to < numOfNodes) {
            let from = to
            to = Math.min(from + 1000, numOfNodes)
            let documents = new Array(to - from)
            for (let i = from; i < to; i++) {
                let src = dist[i]
                let dest = new Array(i)
                for (let j = 0; j < dest.length; j++) {
                    dest[j] = src[j]
                }
                documents[i - from] = {nodeId: i, distances: dest}
            }
            await MongoDB.executeBulkInsertOperations(collection, documents)
        }
        await MongoDB.closeConnection()
    }



    async restoreDistanceMatrixFromDB(config){
        await MongoDB.connectDB()
        let graph = this.readGraph(config)
        let numOfNodes = graph.n
        let to = 0
        let distanceMatrix = new DistanceMatrix()
        while (to < numOfNodes) {
            let from = to
            to = Math.min(from + 5000, numOfNodes)
            let collection = MongoDB.getCollection(config.targetStoreName)
            let nodeDistances = await collection.find({nodeId: {$gte: from, $lte: to}}).toArray()

            for (const nodeDistance of nodeDistances) {
                let distances = nodeDistance.distances
                let d =  numOfNodes < 65535 ? new Uint16Array(distances.length) : new Uint32Array(distances.length)
                for (let i = 0; i < d.length; i++) {
                    d[i] = distances[i]
                }
                distanceMatrix.setDistancesOfVertex(nodeDistance.nodeId, d)
            }
        }
        distanceMatrix.graph = graph
        await MongoDB.closeConnection()
        return distanceMatrix
    }

}

new DistanceOracleExperiment().run().catch(err => {
    console.log(err)
})