const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = 5000;
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7pbou.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
  try {
    await client.connect();
    const itemCollections = client.db('inventoryItems').collection('items')
    itemCollections.insertOne({itemName: "oppo mobile", qty: 12})
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
