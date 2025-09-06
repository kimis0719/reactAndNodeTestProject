// TypeScript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parse, serialize } from 'cookie';
import { destroySession } from '../lib/sessionStore.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const cookies = parse(req.headers.cookie ?? '');
    const sid = cookies['sid'];
    if (sid) await destroySession(sid);

    res.setHeader('Set-Cookie', serialize('sid', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    }));
    return res.status(200).json({ ok: true });
}