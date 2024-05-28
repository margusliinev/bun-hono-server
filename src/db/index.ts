import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

if (!process.env.DB_HOST) throw new Error('DB_HOST is not set');
if (!process.env.DB_USER) throw new Error('DB_USER is not set');
if (!process.env.DB_PASS) throw new Error('DB_PASS is not set');
if (!process.env.DB_NAME) throw new Error('DB_NAME is not set');
if (!process.env.DB_PORT) throw new Error('DB_PORT is not set');

export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT)
});

export const db = drizzle(pool, { mode: 'default', schema: schema });
