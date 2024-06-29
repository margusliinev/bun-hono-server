import { Hono } from 'hono';

const app = new Hono().get('/ok', async (c) => {
    const randomNum = Math.floor(Math.random() * 100);
    if (randomNum < 50) {
        return c.json({ success: false, message: 'Internal Server Error' }, 500);
    }
    return c.json({ success: true, message: 'OK' });
});

export default app;
