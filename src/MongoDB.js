const MongoClient = require('mongodb').MongoClient

class MongoDB {
    constructor() {
        this.client = undefined
        this.db = undefined
        this.connected = false
        this.connectListeners = []
        this.closeRequest = false
    }

    async connectDB(){
        if (this.connected)
            return this.db
        let address = 'mongodb://127.0.0.1:27017?compressors=zlib&zlibCompressionLevel=9'
        console.log('DB Connect :' + address)
        await new Promise((resolve, reject) => {
            const client = this.client = new MongoClient(address,  { useUnifiedTopology: true, compression: [
                    "zstd",
                    "snappy",
                    "zlib"
                ] });

            client.connect((err) => {
                if(err) {
                    return reject(err)
                }
                const db = client.db('do-epxr');
                db.on('close', (err) => {
                    if (this.closeRequest)
                        console.log('DB Connection Closed')
                    else
                        console.log('DB Connection Closed')
                    this.connected = false
                })

                console.log('DB Connection Success')
                this.db = db
                this.connected = true
                this.onConnect()
                resolve()
            })
        })
    }


    onConnect(){
        for (let listener of this.connectListeners) {
            listener()
        }
    }

    getCollection(name){
        return this.db.collection(name)
    }

    async executeBulkInsertOperations(collection, documents, maxBulk = 1000) {
        let index = 0;
        while (index < documents.length) {
            let bulk = collection.initializeUnorderedBulkOp()
            do {
                bulk.insert(documents[index])
                index++;
            } while ((index < documents.length) && ((index%maxBulk) != 0))
            console.log(`[executeBulkInsertOperations] Running bulk opperation. Progress: ${index} of ${documents.length}`)
            await bulk.execute()
        }
        console.log('Bulk insertion succeeded!')
    }

    closeConnection() {
        this.closeRequest = true
        this.client.close()
        this.connected = false
    }
}

module.exports = new MongoDB()
