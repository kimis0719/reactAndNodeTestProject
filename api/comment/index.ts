import type { VercelRequest, VercelResponse } from '@vercel/node';

import dbConnect from '../../lib/dbConnect.js'; // .js 추가
import Comment from '../../models/Comment.js';       // .js 추가

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await dbConnect();

    const { method } = req;

    switch (method) {
        case 'POST':
            try {
                const { postId, upperCommentId = null, content, authorEmail } = req.body ?? {};
                if (!postId || !content || !authorEmail) {
                    return res.status(400).json({ message: 'postId, content, authorEmail are required' });
                }

                const created = await Comment.create({
                    postId,
                    upperCommentId,
                    content,
                    authorEmail,
                });

                res.status(201).json(created);
            } catch (error) {
                res.status(500).json({message: 'Error creating comment', error});
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}