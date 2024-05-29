import { migrate } from 'drizzle-orm/mysql2/migrator';
import { drizzle } from 'drizzle-orm/mysql2';
import { createConnection } from 'mysql2';

const connection = createConnection(process.env.DATABASE_URL!);
const db = drizzle(connection);

const start = async () => {
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    connection.end();
};

start();
