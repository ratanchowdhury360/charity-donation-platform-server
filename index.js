const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT  || 3000 ;


app.use(cors());
app.use(express.json());


//
//



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri = "mongodb+srv://${process.env.DB_USER}:<db_password>@cluster0.u0uz2db.mongodb.net/?appName=Cluster0";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u0uz2db.mongodb.net/?appName=Cluster0`;

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

    //database and collections

    const usersCollection = client.db('usersDB').collection('users');

    // Create user
    app.post('/users', async (req, res) => {
        try {
            const newUser = req.body;

            if (!newUser || !newUser.email) {
                return res.status(400).send({ message: 'Email is required to create a user.' });
            }

            const existingUser = await usersCollection.findOne({ email: newUser.email });
            if (existingUser) {
                return res.status(409).send({ message: 'User with this email already exists.' });
            }

            const userToInsert = {
                ...newUser,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = await usersCollection.insertOne(userToInsert);
            res.status(201).send({ _id: result.insertedId, ...userToInsert });
        } catch (error) {
            console.error('Failed to create user', error);
            res.status(500).send({ message: 'Failed to create user.' });
        }
    });

    // Read all users
    app.get('/users', async (req, res) => {
        try {
            const users = await usersCollection.find().toArray();
            res.send(users);
        } catch (error) {
            console.error('Failed to fetch users', error);
            res.status(500).send({ message: 'Failed to fetch users.' });
        }
    });

    // Read single user
    app.get('/users/:id', async (req, res) => {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: 'Invalid user id.' });
        }

        try {
            const user = await usersCollection.findOne({ _id: new ObjectId(id) });
            if (!user) {
                return res.status(404).send({ message: 'User not found.' });
            }
            res.send(user);
        } catch (error) {
            console.error('Failed to fetch user', error);
            res.status(500).send({ message: 'Failed to fetch user.' });
        }
    });

    // Update user
    app.put('/users/:id', async (req, res) => {
        const { id } = req.params;
        const updates = req.body || {};

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: 'Invalid user id.' });
        }

        try {
            const updatedUser = await usersCollection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: { ...updates, updatedAt: new Date() } },
                { returnDocument: 'after' }
            );

            if (!updatedUser.value) {
                return res.status(404).send({ message: 'User not found.' });
            }

            res.send(updatedUser.value);
        } catch (error) {
            console.error('Failed to update user', error);
            res.status(500).send({ message: 'Failed to update user.' });
        }
    });

    // Delete user
    app.delete('/users/:id', async (req, res) => {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ message: 'Invalid user id.' });
        }

        try {
            const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
            if (result.deletedCount === 0) {
                return res.status(404).send({ message: 'User not found.' });
            }

            res.send({ message: 'User deleted successfully.' });
        } catch (error) {
            console.error('Failed to delete user', error);
            res.status(500).send({ message: 'Failed to delete user.' });
        }
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);





app.get('/',(req,res)=>{
    res.send('Coffee server is getting hotter')
})

app.listen(port, ()=>{
    console.log(`Coffee server running on port ${port}`)
})
 

