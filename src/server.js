import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
  db = mongoClient.db("batePapoUol");
});


const app = express();
app.use(cors());
app.use(express.json());

app.post('/participants', async (req, res) => {
const { name } = req.body;

try {
    await db.collection('participants').insertOne({ name });
    res.sendStatus(200);
}
catch (error) {
    res.sendStatus(500);
}
});

app.get('/participants', async (req, res) => {
    const participants = await db.collection('participants').find().toArray();
    console.log(participants);
    res.send(participants);
});

app.post('/messages', async (req, res) => {
    
});

app.get('/messages', async (req, res) => {
    
});

app.post('/status', async (req, res) => {
    
});


app.listen(process.env.PORT, () => {
    console.log(`Server is litening on port ${process.env.PORT}.`);
  });