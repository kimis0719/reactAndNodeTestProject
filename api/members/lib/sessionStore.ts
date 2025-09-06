import crypto from 'node:crypto';
import Session from '../../../models/Session.js';
import dbConnect from '../../../lib/dbConnect.js';

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7일

type SessionLean = {
  _id: string;
  uid: number;
  email: string;
  createdAt: Date;
  expiresAt: Date;
};

export async function createSession(
  payload: { uid: number; email: string },
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<string> {
  await dbConnect(); // 연결 보장

  const sessionId = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = new Date(now + ttlSeconds * 1000);

  await Session.create({
    _id: sessionId,
    uid: payload.uid,
    email: payload.email,
    createdAt: new Date(now),
    expiresAt,
  });

  return sessionId;
}

export async function getSession(sessionId: string) {
  await dbConnect(); // 연결 보장

  const doc = await Session.findById(sessionId)
    .select('uid email expiresAt')
    .lean<SessionLean | null>();

  if (!doc) return null;
  if (doc.expiresAt.getTime() <= Date.now()) return null;

  return { uid: doc.uid, email: doc.email };
}

export async function destroySession(sessionId: string) {
  await dbConnect(); // 연결 보장

  await Session.deleteOne({ _id: sessionId });
}