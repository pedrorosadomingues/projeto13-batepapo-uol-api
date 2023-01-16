import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
import dayjs from 'dayjs';

dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;
mongoClient.connect(() => {
    db = mongoClient.db();
});

const app = express();
app.use(cors());
app.use(express.json());

app.post('/participants', async (req, res) => {
    const { name } = req.body;

    try {
        const isLogged = await db.collection('participants').findOne({ name });

        if (isLogged) return res.sendStatus(409);
        if (!name || name === Number(name)) return res.sendStatus(422);
        await db.collection('participants').insertOne({ name });
        res.sendStatus(201);
    }
    catch (error) {
        res.sendStatus(500);
    }
});

app.get('/participants', async (req, res) => {

    try {

        const participants = await db.collection('participants').find().toArray();

        console.log(participants);

        if (participants.length > 0) {

            setInterval(() => {

                participants.forEach(async (p) => {

                    if (Date.now() - p.lastStatus > 10000 || p.lastStatus === undefined) {

                        try {
                            await db.collection('messages').insertOne({ from: p.name, to: 'Todos', text: 'sai da sala...', type: 'message', time: dayjs().format('HH:MM:SS') }),
                                await db.collection('participants').deleteOne({ name: p.name })
                               
                        } catch (error) {
                            res.sendStatus(500);
                        }

                    }
                })
            }, 15000);
        }
        res.send(participants);
    } catch (error) {

        res.sendStatus(500);
    }

});

app.post('/messages', async (req, res) => {
    const { to, text, type } = req.body;

    const from = req.headers.user;

    const messageSchema = joi.object({
        to: joi.string().required(),
        text: joi.string().required(),
        type: joi.string().valid('private_message', 'message').required(),
    });

    const validation = messageSchema.validate({ to, text, type }, { abortEarly: false });

    const time = dayjs().format('HH:MM:SS');

    if (validation.error) {
        const errorMessages = validation.error.details.map((error) => error.message);
        return res.status(422).send(errorMessages)
    }

    try {
        const data = await db.collection('messages').insertOne({ from, to, text, type, time });
        res.sendStatus(201);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/messages', async (req, res) => {

    const { limit } = req.query;
    const { user } = req.headers;

    try {

        const messages = await db.collection('messages').find().toArray();

        const privateMessages = messages.filter((message) => message.type === 'private_message' && (message.from === user || message.to === user));

        const publicMessages = messages.filter((message) => message.type === 'message');

        const allMessages = privateMessages.concat(publicMessages);

        if (limit) {
            const messagesLimit = allMessages.reverse().slice(0, Number(limit));
            res.send(messagesLimit);
        }
        res.send(allMessages.reverse());


    } catch (error) {
        res.sendStatus(500);
    }

});

app.post('/status', async (req, res) => {

    console.log(Date.now());
    const username = req.headers.user;

    try {
        const isLogged = await db.collection('participants').findOne({ name: username });
        if (!isLogged) {
            return res.sendStatus(404);
        }

        const data = await db.collection('participants').updateOne({ name: username }, { $set: { lastStatus: Date.now() } });

        res.sendStatus(200);

    } catch (error) {
        res.sendStatus(500);
    }
});


app.listen(process.env.PORT, () => {
    console.log(`Server is litening on port ${process.env.PORT}.`);
});