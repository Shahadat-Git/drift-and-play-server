const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
            const limit = parseInt(req.query?.limit);
            const search = req.query?.name;
            const category = req.query?.category;
            let query = {};
            if (req.query?.email) {
                query = { ...query, sellerEmail: req.query.email }
            }

            if (req.query?.name) {
                query = {
                    ...query, $or: [
                        { name: { $regex: search, $options: "i" } }
                    ]
                }
            }

            if (req.query?.category) {
                query = {
                    ...query, $or: [
                        { subCategory: { $regex: category, $options: "i" } }
                    ]
                }
            }
            const result = await toyCollection.find(query).limit(limit).toArray();
            res.send(result)
        })

        app.post('/toys', async (req, res) => {
            const toy = req.body;
            const result = await toyCollection.insertOne(toy);
            res.send(result)
        });


        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;

            if (id.length === 24) {
                const query = { _id: new ObjectId(id) };
                const result = await toyCollection.findOne(query);
                res.send(result);
            }
            else {
                res.send({ error: true })
            }
        });

        app.put('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    price: data.price,
                    quantity: data.quantity,
                    description: data.description,
                }
            }
            const result = await toyCollection.updateOne(query, updateDoc, options);
            res.send(result);
        });

        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        });

        app.get('/gallery', async (req, res) => {
            const limit = parseInt(req.query?.limit);
            const search = req.query?.name;
            const category = req.query?.category;
            let query = {};
            if (req.query?.email) {
                query = { ...query, sellerEmail: req.query.email }
            }

            if (req.query?.name) {
                query = {
                    ...query, $or: [
                        { name: { $regex: search, $options: "i" } }
                    ]
                }
            }

            if (req.query?.category) {
                query = {
                    ...query, $or: [
                        { subCategory: { $regex: category, $options: "i" } }
                    ]
                }
            }

            const projection = { picture: 1, name: 1 };
            const sort = { rating: -1 };
            const result = await toyCollection.find(query).sort(sort).project(projection).limit(limit).toArray();
            res.send(result)
        })



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
