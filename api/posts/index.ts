import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from '../../lib/dbConnect.js'; // .js 추가
import Post from '../../models/Post.js';       // .js 추가

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await dbConnect();

    const { method } = req;

    switch (method) {
        case 'GET':
            try {
                const posts = await Post.find().sort({ createdAt: -1 });
                res.status(200).json(posts);
            } catch (error) {
                res.status(500).json({ message: 'Error fetching posts', error });
            }
            break;
        case 'POST':
            try {
                const { title, content } = req.body;
                const newPost = new Post({ title, content });
                await newPost.save();
                res.status(201).json(newPost);
            } catch (error) {
                res.status(500).json({ message: 'Error creating post', error });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}