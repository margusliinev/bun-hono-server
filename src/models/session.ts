import { db } from '@/db';
import type { Session } from '@/db/schema';
import { sessionsTable } from '@/db/schema';
import { and, eq, gt } from 'drizzle-orm';

const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 7;

export async function createSession(userId: Session['user_id']) {
    try {
        return await db.transaction(async (tx) => {
            const [newSession] = await tx.insert(sessionsTable).values({ user_id: userId, expires_at: new Date(Date.now() + SESSION_EXPIRATION_TIME) });
            const createdSession = await tx.query.sessionsTable.findFirst({ where: eq(sessionsTable.id, newSession.insertId) });
            return createdSession;
        });
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getUserBySessionId(sessionId: Session['id']) {
    try {
        const result = await db.query.sessionsTable.findFirst({
            columns: {},
            with: { user: { columns: { password: false } } },
            where: and(eq(sessionsTable.id, sessionId), gt(sessionsTable.expires_at, new Date()))
        });
        return result?.user;
    } catch (error) {
        console.error(error);
        return null;
    }
}
