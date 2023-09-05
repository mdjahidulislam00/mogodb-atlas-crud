const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion} = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// sending an HTML file to localhost
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

//mongodb Atlas connection sting
const uri = "mongodb+srv://Jahid-Programming-center:2YmEbpT3jCn1aoh9@cluster0.aa0ccjg.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// connect to Mongodb 
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
connectToMongoDB();

// Read data from mongodb database
app.get('/get-users', async (req, res) => {
  try {
    if (client.connect()) {
      const db = client.db("amarShopdb");
      const collection = db.collection("product");

   // find code goes here
   const getData = await collection.find().toArray();
   // iterate code goes here
    res.send(getData);
    } else {
      res.status(500).json({ error: 'MongoDB is not connected' });
    }
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ error: 'An error occurred while retrieving users' });
  }
});

// handel_data to send atlas in post request from html-from
app.post('/register', async (req, res) => {
  try {
    const db = client.db("amarShopdb");
    const coll = db.collection("product");
    const user = req.body;
    const result = await coll.insertOne(user);
    console.log(result);
    res.redirect('/')
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while registering the user' });
  }
});


// Delete user from database
app.delete('/delete/:id', async (req, res) => {
  const deleteItemId = req.params.id;
  const db = client.db("amarShopdb");
  const coll = db.collection("product");
  
  try {
    const result = await coll.deleteOne({ _id: new ObjectId(deleteItemId) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });

    } else{
      return res.send(deletedCount > 0)
    }
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Edit user from database
app.get('/updateUser/:id', async (req, res) => {
  const updateId = req.params.id;
  const db = client.db("amarShopdb");
  const coll = db.collection("product");
  
  try {
    const result = await coll.findOne({ _id: new ObjectId(updateId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    return res.send( result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});


// Update data in MongoDB
app.patch('/updatedUser/:id', async (req, res) => {
  const updatedId = req.params.id;
  const updatedData = req.body; // Access the updated data from the request body
  console.log(updatedData, updatedId)
  
  if (!updatedData) {
    return res.status(400).json({ error: 'Request body is missing updated data' });
  }

  const db = client.db("amarShopdb");
  const coll = db.collection("product");
  
  try {
    const result = await coll.updateOne({ _id: new ObjectId(updatedId) },{ $set: updatedData})

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    if (result.modifiedCount === 0) {
      return res.json({ message: 'No changes made' });
    }

    return res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});


//configure to Listen server Port
app.listen(3000, () => {
  console.log('Server on port 3000 is running successfully');
});
