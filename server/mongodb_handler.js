const MongoClient = require("mongodb").MongoClient;
const assert = require('assert');

class MongoHandler {
    constructor() {
        this.mongoClient = null;
        this.mongoUser = "mongoadmin";
        this.mongoPass = "secret";
        this.mongoURL = "localhost:27017";
        this.host = "mongodb://" 
            + this.mongoUser + ":" 
            + this.mongoPass 
            + "@" + this.mongoURL;
        this.dbName = 'myproject';
        this.db = null;
    }

    connect() {
        // connect to mongodb
        this.mongoClient = new MongoClient(this.host, { useNewUrlParser: true});
        this.mongoClient.connect(function(err) {
            assert.equal(null, err);
            console.log("Connected successfully to MongoDB");
        });
        this.db = this.mongoClient.db(this.dbName);
    }

    insert() {
        // Get the documents collection
        const collection = this.db.collection('coordinates');
        // Insert some documents
        collection.insertMany([
            {
                device_id: 7,
                latitude: 123.123,
                longitude: 321.321
            },
            {
                device_id: 8,
                latitude: 444.444,
                longitude: 111.222
            },
        ], function(err, result) {
            assert.equal(err, null);
            assert.equal(2, result.insertedCount);
            assert.equal(2, Object.keys(result.insertedIds).length);
            console.log("Inserted 2 documents into collection");
            callback(result);
        });
    }

};

module.exports = MongoHandler;