import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parse } from 'cookie';
import { getSession } from '../lib/sessionStore.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const cookies = parse(req.headers.cookie ?? '');
    const sid = cookies['sid'];
    if (!sid) return res.status(200).json({ authenticated: false });

    const session = await getSession(sid);
    if (!session) return res.status(200).json({ authenticated: false });

    return res.status(200).json({ authenticated: true, user: session });
}
