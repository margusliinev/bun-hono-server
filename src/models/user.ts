import type { NewUser, User } from '../db/schema';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { db } from '../db';

export async function getUserById(id: User['id']) {
    try {
        return await db.query.usersTable.findFirst({ where: eq(usersTable.id, id), columns: { password: false } });
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getUserByUsername(username: User['username']) {
    try {
        return await db.query.usersTable.findFirst({ where: eq(usersTable.username, username.toLowerCase()), columns: { password: false } });
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getUserByEmail(email: User['email']) {
    try {
        return await db.query.usersTable.findFirst({ where: eq(usersTable.email, email.toLowerCase()), columns: { password: false } });
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getUserByEmailWithPassword(email: User['email']) {
    try {
        return await db.query.usersTable.findFirst({ where: eq(usersTable.email, email.toLowerCase()) });
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getAllUsers() {
    try {
        return await db.query.usersTable.findMany({ columns: { password: false } });
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function createUser(user: NewUser) {
    try {
        return await db.transaction(async (tx) => {
            const [newUser] = await tx.insert(usersTable).values(user);
            const createdUser = await tx.query.usersTable.findFirst({ where: eq(usersTable.id, newUser.insertId), columns: { password: false } });
            return createdUser;
        });
    } catch (error) {
        console.error(error);
        return null;
    }
}
