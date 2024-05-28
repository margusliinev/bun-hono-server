import { usersTable } from './db/schema';
import { logger } from 'hono/logger';
import { Hono } from 'hono';
import { db } from './db';

if (!process.env.PORT) throw new Error('PORT is not defined');

const app = new Hono();

app.use(logger());

app.get('/', async (c) => {
    return c.json({ success: true, message: 'Hello World' });
});

app.get('/users', async (c) => {
    const users = await db.select().from(usersTable);
    return c.json({ success: true, data: users });
});

export default { fetch: app.fetch, port: process.env.PORT };
