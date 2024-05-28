import { defineConfig } from 'drizzle-kit';

if (!process.env.DB_HOST) throw new Error('DB_HOST is not set');
if (!process.env.DB_USER) throw new Error('DB_USER is not set');
if (!process.env.DB_PASS) throw new Error('DB_PASS is not set');
if (!process.env.DB_NAME) throw new Error('DB_NAME is not set');
if (!process.env.DB_PORT) throw new Error('DB_PORT is not set');

export default defineConfig({
    dialect: 'mysql',
    schema: './src/db/schema.ts',
    out: './src/db/migrations',
    dbCredentials: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT)
    },
    migrations: {
        schema: './src/db/schema.ts',
        table: 'migrations'
    }
});
