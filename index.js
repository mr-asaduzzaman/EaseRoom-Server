const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
    cors({
        origin: [
            'http://localhost:5175',  // Your local frontend
            'https://ease-room.web.app', // Your production frontend (if any)
            'https://ease-room.firebaseapp.com', // Your production frontend (if any)
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allow specific methods
        allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
    })
);
app.use(express.json());

app.get('/', (req, res) => {
    res.send('EaseRoom server is running properly...!!');
});

app.listen(port, () => {
    console.log(`EaseRoom server is running at: ${port}`);
});

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.diruq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();  // Establish MongoDB connection

        // Collections
        const EaseRoom = client.db('EaseRoom').collection('Rooms');
        const BookedRoomsCollection = client.db('EaseRoom').collection('BookedRooms');
        const ReviewsCollection = client.db('EaseRoom').collection('Reviews');

        // Get all rooms data
        app.get('/Rooms', async (req, res) => {
            try {
                const result = await EaseRoom.find().toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: 'Error fetching rooms', error });
            }
        });

        // Get single room data
        app.get('/Rooms/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const result = await EaseRoom.findOne({ _id: new ObjectId(id) });
                if (result) {
                    res.send(result);
                } else {
                    res.status(404).send({ message: 'Room not found' });
                }
            } catch (error) {
                res.status(500).send({ message: 'Error fetching room', error });
            }
        });

        // Booked rooms endpoints
        app.post('/BookedRooms', async (req, res) => {
            try {
                const result = await BookedRoomsCollection.insertOne(req.body);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: 'Error booking room', error });
            }
        });

        app.get('/BookedRooms', async (req, res) => {
            const email = req.query.email;
            const query = email ? { user_email: email } : {};
            try {
                const result = await BookedRoomsCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: 'Error fetching bookings', error });
            }
        });

        app.delete('/BookedRooms/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const result = await BookedRoomsCollection.deleteOne({ _id: new ObjectId(id) });
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: 'Error deleting booking', error });
            }
        });

        app.patch('/BookedRooms/:id', async (req, res) => {
            const id = req.params.id;
            const { bookingDate } = req.body;
            try {
                const result = await BookedRoomsCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { bookingDate } }
                );
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: 'Error updating booking date', error });
            }
        });

        // Reviews endpoints
        app.post('/reviews', async (req, res) => {
            try {
                const result = await ReviewsCollection.insertOne(req.body);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: 'Error submitting review', error });
            }
        });

        app.get('/reviews', async (req, res) => {
            try {
                const result = await ReviewsCollection.find().toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: 'Error fetching reviews', error });
            }
        });

        app.get('/Reviews/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const result = await ReviewsCollection.findOne({ _id: new ObjectId(id) });
                if (result) {
                    res.send(result);
                } else {
                    res.status(404).send({ message: 'Review not found' });
                }
            } catch (error) {
                res.status(500).send({ message: 'Error fetching review', error });
            }
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

run().catch(console.dir);
