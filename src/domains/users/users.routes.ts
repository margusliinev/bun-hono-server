import { authenticate } from '@/middleware';
import { getAllUsers, getUserById } from '@/models/user';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

const app = new Hono({ strict: true });

app.use(authenticate);

app.get('/', async (c) => {
    const users = await getAllUsers();
    if (!users) throw new HTTPException(404, { message: 'Users not found' });

    return c.json({ success: true, data: users });
});

app.get('/me', async (c) => {
    const userID = c.get('user');

    const user = await getUserById(userID);
    if (!user) throw new HTTPException(404, { message: 'User not found' });

    return c.json({ success: true, data: user });
});

export default app;
