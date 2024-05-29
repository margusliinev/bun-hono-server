import { getAllUsers, getUserById } from '@/models/user';
import { Hono } from 'hono';

export const users = new Hono();

users.get('/', async (c) => {
    const users = await getAllUsers();
    return c.json({ success: true, data: users });
});

users.get('/me', async (c) => {
    const userID = c.get('user');
    const user = await getUserById(userID);
    return c.json({ success: true, data: user });
});
