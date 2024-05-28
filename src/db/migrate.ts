import { migrate } from 'drizzle-orm/mysql2/migrator';
import { drizzle } from 'drizzle-orm/mysql2';
import { createConnection } from 'mysql2';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const connection = createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const start = async () => {
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    connection.end();
};

start();
