import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dialect: 'mysql',
    schema: './src/db/schema.ts',
    out: './src/db/migrations',
    dbCredentials: {
        url: process.env.DATABASE_URL!
    },
    migrations: {
        schema: './src/db/schema.ts',
        table: 'migrations'
    }
});
