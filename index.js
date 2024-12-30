const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('EaseRoom server is running properly...!!')
})

app.listen(port, () => {
    console.log(`EaseRoom server is running at: ${port}`)
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.diruq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // All Rooms Apis get data
        const EaseRoom = client.db('EaseRoom').collection('Rooms')
        app.get('/Rooms', async (req, res) => {
            const cursor = EaseRoom.find();
            const result = await cursor.toArray();
            res.send(result)
        })
        

        // Single Room data
        app.get('/Rooms/:id', async(req, res) => {
            const id = req.params.id
            const query = {_id: new ObjectId(id)}
            const result = await EaseRoom.findOne(query)
            res.send(result)
        })



        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




// cZ99EcyHJ4VzPcLg
// easeroom