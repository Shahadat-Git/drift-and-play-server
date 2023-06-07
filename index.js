const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@simple-crud-server.g8zjk15.mongodb.net/?retryWrites=true&w=majority`;



const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



async function run() {
    try {
        await client.connect();
        const toyCollection = client.db('drift&playDB').collection('toys');

        app.get('/toys', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { sellerEmail: req.query.email }
            }
            const result = await toyCollection.find(query).toArray();
            res.send(result)
        })

        app.post('/toys', async (req, res) => {
            const toy = req.body;
            const result = await toyCollection.insertOne(toy);
            res.send(result)
        });



        await client.db('admin').command({ ping: 1 })
        console.log('mongodb successfully connected')
    } finally {
        // await client.close();
    }
}

run().catch(console.dir)





app.get('/', (req, res) => {
    res.send('server is running')
});

app.listen(port, () => {
    console.log(`server running on ${port}`)
});
