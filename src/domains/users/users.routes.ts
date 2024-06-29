import { getAllUsers, getUserById } from '../../models/user';
import { HTTPException } from 'hono/http-exception';
import { authenticate } from '../../middleware';
import { Hono } from 'hono';

const app = new Hono()
    .use(authenticate)
    .get('/', async (c) => {
        const users = await getAllUsers();
        if (!users) throw new HTTPException(404, { message: 'Users not found' });

        return c.json({ success: true, data: users });
    })
    .get('/me', async (c) => {
        const userID = c.get('user');

        const user = await getUserById(userID);
        if (!user) throw new HTTPException(404, { message: 'User not found' });

        return c.json({ success: true, data: user });
    });
export default app;
