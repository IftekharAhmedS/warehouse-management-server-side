const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
var jwt = require('jsonwebtoken');
const port = 5000;
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());

function verifyToken(req, res, next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message: 'Unauthorized Access'})
  }
  next()
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

    app.get('/items', verifyToken , async (req, res) => {
      const query = {};
      const cursor = itemCollections.find(query)
      const item = await cursor.toArray();
      res.send(item)
    })

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
