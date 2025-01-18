const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017"; // Update the URI if needed
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db('test'); // Replace 'test' with your database name
        const collection = database.collection('example'); // Replace 'example' with your collection name
        const docs = await collection.find().toArray();
        console.log(docs);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
