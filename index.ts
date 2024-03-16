import express, { Request, Response } from 'express';
import { Condition, MongoClient, ObjectId } from 'mongodb';
import { configDotenv } from 'dotenv';
import { responseText } from './response';
configDotenv()

const app = express();
const PORT = 3000;
const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = 'test';

// Connect to MongoDB
let client: MongoClient;
if (MONGO_URL) {
    client = new MongoClient(MONGO_URL);
}

async function start() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

start();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.get('/item/:id', async (req: Request, res: Response) => {
    const { success, noExistedId } = responseText
    try {
        const db = client.db(DB_NAME);
        const _id = new ObjectId(req.params.id)
        const items = await db.collection('items').findOne({ _id })
        res.json({ ...success, data: [items] });
    } catch (error) {
        res.json(noExistedId)
    }

});

app.get('/items', async (req: Request, res: Response) => {
    const db = client.db(DB_NAME);
    const items = await db.collection('items').find().toArray();
    res.json(items);
});

app.post('/item', async (req: Request, res: Response) => {
    const { insert, notInsert } = responseText
    try {
        const db = client.db(DB_NAME);
        const newUser = req.body;
        const result = await db.collection('items').insertOne(newUser);
        res.json({ ...insert, documentId: result.insertedId })
    } catch {
        res.json(notInsert)
    }
});

app.put('/items/:id', async (req: Request, res: Response) => {
    const { update, noExistedId } = responseText
    try {
        const db = client.db(DB_NAME);
        const _id = new ObjectId(req.params.id);
        const updatedUser = req.body;
        const result = await db.collection('items').updateOne({ _id }, { $set: updatedUser });
        res.json(update);
    } catch (error) {
        res.json(noExistedId);
    }

});

// app.delete('/items/:id', async (req: Request, res: Response) => {
//     const db = client.db(DB_NAME);
//     const userId = req.params.id;
//     const result = await db.collection('items').deleteOne({ _id: userId });
//     res.json({ message: 'User deleted successfully' });
// });

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});