import { authGuard } from '@/auth/auth.guard';
import { getAllUsers, getUserById } from '@/models/user';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const users = new Hono();
users.use(authGuard);

users.get('/', async (c) => {
    const users = await getAllUsers();
    if (!users) throw new HTTPException(404, { message: 'Users not found' });

    return c.json({ success: true, data: users });
});

users.get('/me', async (c) => {
    const userID = c.get('user');

    const user = await getUserById(userID);
    if (!user) throw new HTTPException(404, { message: 'User not found' });

    return c.json({ success: true, data: user });
});
