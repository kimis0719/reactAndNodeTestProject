import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from '../../../lib/dbConnect.js'; // .js 추가
import Post from '../../../models/Post.js';       // .js 추가

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await dbConnect();

    const { method } = req;
    const { id } = req.query;

    if (method === 'PUT') {
        try {
            const { like } = req.body;
            const updatedPost = await Post.findByIdAndUpdate(id, { like }, { new: true });
            if (!updatedPost) {
                return res.status(404).json({ message: 'Post not found' });
            }
            res.status(200).json(updatedPost);
        } catch (error) {
            res.status(500).json({ message: 'Error updating post', error });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
}