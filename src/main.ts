import express, { Request, Response } from 'express';
import { getUserByEmail } from './models/user';

const app = express();

/**
 * Promise<void> instead of Promise<Response> as this is an async function and express does not expect a Response object to be returned 
 * instead it expects the object to be sent inside the function
 */
app.get('/login', async (req: Request, res: Response): Promise<void> => {
    const email = req.query.email as string;
    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
    }
    try {
        const user = await getUserByEmail(email);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(3000, () => {
    console.log('server running');
});
