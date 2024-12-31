const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('EaseRoom server is running properly...!!');
});

app.listen(port, () => {
    console.log(`EaseRoom server is running at: ${port}`);
});

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.diruq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server
        await client.connect();
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // Collections
        const EaseRoom = client.db('EaseRoom').collection('Rooms');
        const BookedRoomsCollection = client.db('EaseRoom').collection('BookedRooms');
        const ReviewsCollection = client.db('EaseRoom').collection('Reviews'); // New reviews collection

        // Get all rooms data
        app.get('/Rooms', async (req, res) => {
            const cursor = EaseRoom.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        // Get single room data
        app.get('/Rooms/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await EaseRoom.findOne(query);
            res.send(result);
        });

        // Post booked rooms
        app.post('/BookedRooms', async (req, res) => {
            const application = req.body;
            const result = await BookedRoomsCollection.insertOne(application);
            res.send(result);
        });

        // Get booked rooms (with optional filtering by email)
        app.get('/BookedRooms', async (req, res) => {
            const email = req.query.email;
            let query = {};
            if (email) {
                query = { user_email: email };
            }
            const result = await BookedRoomsCollection.find(query).toArray();
            res.send(result);
        });

        // Delete booked room
        app.delete('/BookedRooms/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await BookedRoomsCollection.deleteOne(query);
            res.send(result);
        });

        // Update booking date
        app.patch('/BookedRooms/:id', async (req, res) => {
            const id = req.params.id;
            const { bookingDate } = req.body;

            try {
                const filter = { _id: new ObjectId(id) };
                const updateDoc = {
                    $set: {
                        bookingDate: bookingDate,
                    },
                };

                const result = await BookedRoomsCollection.updateOne(filter, updateDoc);

                if (result.modifiedCount > 0) {
                    res.status(200).send({ modifiedCount: result.modifiedCount, message: 'Booking date updated successfully.' });
                } else {
                    res.status(400).send({ modifiedCount: result.modifiedCount, message: 'No changes were made.' });
                }
            } catch (error) {
                console.error('Error updating booking date:', error);
                res.status(500).send({ error: 'An error occurred while updating the booking date.' });
            }
        });

        // Add a review
        app.post('/reviews', async (req, res) => {
            const reviewPayload = req.body;
            try {
                const result = await ReviewsCollection.insertOne(reviewPayload);
                if (result.insertedId) {
                    res.status(201).send({ insertedId: result.insertedId });
                } else {
                    res.status(400).send({ message: 'Failed to submit the review.' });
                }
            } catch (error) {
                console.error('Error submitting review:', error);
                res.status(500).send({ message: 'An error occurred while submitting the review.' });
            }
        });

        app.get('/reviews', async (req, res) => {
            const cursor = ReviewsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/Reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await ReviewsCollection.find(query).toArray()
            res.send(result);
        });

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

run().catch(console.dir);
