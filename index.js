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

        //Collections
        const EaseRoom = client.db('EaseRoom').collection('Rooms')
        const BookedRoomsCollection= client.db('EaseRoom').collection('BookedRooms')



        // Get all rooms data
        app.get('/Rooms', async (req, res) => {
            const cursor = EaseRoom.find();
            const result = await cursor.toArray();
            res.send(result)
        })
        

        // Get single Room data
        app.get('/Rooms/:id', async(req, res) => {
            const id = req.params.id
            const query = {_id: new ObjectId(id)}
            const result = await EaseRoom.findOne(query)
            res.send(result)
        })


        // Post Booked Rooms
        app.post('/BookedRooms', async (req, res) => {
            const application = req.body;
            const result = await BookedRoomsCollection.insertOne(application)
            res.send(result)
        })


        app.get('/BookedRooms', async (req, res) => {
            const email = req.query.email;
            const query = {user_email : email }
            const result = await BookedRoomsCollection.find(query).toArray();
            res.send(result)
        })
        

        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




// cZ99EcyHJ4VzPcLg
// easeroom