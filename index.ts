import express, { Request, Response } from 'express';
import { Document, MongoClient, ObjectId } from 'mongodb';
import { configDotenv } from 'dotenv';
import { responseText } from './response';
import { encryptedData } from './hash';
configDotenv()

const { MONGO_URL, PORT, HASH_SECRET_KEY } = process.env
const DB_NAME = "test"
const collectionName = "items"
const app = express();

// Connect to MongoDB
let client: MongoClient;
let secretKey: string;
if (MONGO_URL) {
    client = new MongoClient(MONGO_URL);
}

if (HASH_SECRET_KEY) {
    secretKey = HASH_SECRET_KEY;
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
    const { success, noExistedId } = responseText;
    try {
        const db = client.db(DB_NAME);
        const _id = new ObjectId(req.params.id)
        const items = await db.collection(collectionName).findOne({ _id })
        if (items?._id) {
            res.json({ ...success, data: [items] });
        } else {
            throw new Error();
        }
    } catch (error) {
        res.status(400).json(noExistedId);
    }

});

app.get('/items', async (req: Request, res: Response) => {
    const db = client.db(DB_NAME);
    let items: string | Document = await db.collection(collectionName).find().toArray();
    items = encryptedData(items, secretKey)
    res.json(items);
});

app.post('/item', async (req: Request, res: Response) => {
    const { insert, notInsert } = responseText;
    try {
        const db = client.db(DB_NAME);
        const newUser = req.body;
        const result = await db.collection(collectionName).insertOne(newUser);
        res.json({ ...insert, documentId: result.insertedId });
    } catch {
        res.status(400).json(notInsert);
    }
});

app.put('/items/:id', async (req: Request, res: Response) => {
    const { update, noExistedId } = responseText
    try {
        const db = client.db(DB_NAME);
        const _id = new ObjectId(req.params.id);
        const updatedUser = req.body;
        await db.collection(collectionName).updateOne({ _id }, { $set: updatedUser });
        res.json(update);
    } catch (error) {
        res.status(400).json(noExistedId);
    }

});

app.delete('/items/:id', async (req: Request, res: Response) => {
    const { remove, noExistedId } = responseText
    try {
        const db = client.db(DB_NAME);
        const _id = new ObjectId(req.params.id);
        await db.collection(collectionName).deleteOne({ _id });
        res.json(remove);
    } catch (error) {
        res.status(400).json(noExistedId);
    }
});

// Define your MongoDB aggregation pipeline stages
const aggregationPipeline = [
    {
        $group: {
            _id: '$discount',
            totalItems: { $sum: 1 },
            totalPrice: { $sum: '$price' }
        }
    },
    {
        $sort: { total: -1 }
    }
];

app.get('/aggregate', async (req: Request, res: Response) => {
    const { error } = responseText
    try {
        const db = client.db(DB_NAME)
        const result = await db.collection(collectionName).aggregate(aggregationPipeline).toArray();
        console.log(result)
        res.json(result)
    } catch {
        res.status(400).json(error)
    }

});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
