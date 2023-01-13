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
    const { to, text, type } = req.body;
    const from = req.headers.user;

    try {
        await db.collection('messages').insertOne({ from, to, text, type });
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/messages', async (req, res) => {
    try {
        const messages = await db.collection('messages').find().toArray();
        res.send(messages);
        console.log(messages);
    } catch (error) {
        res.sendStatus(500);
    }
   
});

app.post('/status', async (req, res) => {
    const username = req.headers.user;
    try {
        await
    } catch (error) {
        
    }
});


app.listen(process.env.PORT, () => {
    console.log(`Server is litening on port ${process.env.PORT}.`);
  });