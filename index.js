const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const port = 3000 || process.env.PORT
require('dotenv').config()


// middlewire
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.quaequt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

console.log(uri)

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


    const jobCollection = client.db("jobStack").collection("jobs")

    // get all jobs
    app.get("/all-jobs" , async (req,res) =>{
        const jobs = await jobCollection.find().toArray()
        res.send(jobs);
    })

    // get data by email
    app.get("/myJobs/:email" , async(req,res) =>{
        console.log(req.params.email)
        const result = await jobCollection.find({ postedBy: req.params.email }).toArray()
        // console.log(result)
        res.send(result)
    })

    // post a job
    app.post("/post-job" , async(req,res) =>{
        const body = req.body;
        body.createAt = new Date()
        const result= await jobCollection.insertOne(body);
        if(result.insertedId){
            return res.status(200).send(result)
        }
        else{
            return res.status(404).send({ message: "try again!"})
        }
    })

    // delete a job
    app.delete('/job/:id' ,async(req,res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await jobCollection.deleteOne(query)
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})