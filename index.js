const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();

// Middlewares

app.use(cors());
app.use(express.json());

// JWT Verification Function

function verifyToken(req, res, next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message: 'Unauthorized Access'})
  }
  const key = authHeader.split(' ')[1];
  jwt.verify(key, process.env.ACCESS_TOKEN, (error, decoded) => {
    if(error){
      return res.status(403).send({message: 'Access Forbidden'})
    }
    req.decoded = decoded;
    next()
  })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7pbou.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
  try {
    await client.connect();
    const itemCollections = client.db('inventoryItems').collection('items')

    app.post('/login', async (req, res)=> {
      const user = req.body;
      const accessKey = jwt.sign(user, process.env.ACCESS_TOKEN);
      res.send({ accessKey });
    })

    // Item API

    app.get('/items', async (req, res) => {
      const email = req.query.email;
      const query = {};
      const cursor = itemCollections.find(query)
      const item = await cursor.toArray();
      res.send(item)
    })

    // Single Item API

    app.get('/items/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const item = await itemCollections.findOne(query);
      res.send(item)
    })

    // Update Item API

    app.put('/items/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const updateItem = req.body;
      const filter = {_id: ObjectId(id)};
      const options = {upsert: true}
      const updateFields = {
        $set: {
          productQTY: updateItem.productQTY
        }
      }
      const item = await itemCollections.updateOne(filter, updateFields, options);
      res.send(item)
    })

    // Delete Item API

    app.delete('/items/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const item = await itemCollections.deleteOne(query);
      res.send(item)
    })

    // Get Filtered Item API

    app.get('/filtered-items', verifyToken , async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if(email === decodedEmail){
        const query = {email};
        const cursor = itemCollections.find(query)
        const item = await cursor.toArray();
        res.send(item)
      }
      else{
        res.status(403).send({message: 'Access Forbidden'})
      }
    })

    // Add New Item API

    app.post('/items', async (req, res) => {
      const newItem = req.body;
      const item = await itemCollections.insertOne(newItem);
      res.send(item)
  })

    console.log('DB connected')
  }
  finally {

  }
}

run().catch(console.error)

app.get('/', (req, res)=>{
  res.send('Running')
})

app.listen(port, () => {
  console.log('listening')
})
