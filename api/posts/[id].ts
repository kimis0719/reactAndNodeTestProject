import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from '../../lib/dbConnect.js'; // .js 추가
import Post from '../../models/Post.js';       // .js 추가

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await dbConnect();

    const { method } = req;
    const { id } = req.query;

    switch (method) {
        case 'GET':
            try {
                const post = await Post.findById(id);
                if (!post) return res.status(404).json({ message: 'Post not found' });
                res.status(200).json(post);
            } catch (error) {
                res.status(500).json({ message: 'Error fetching post', error });
            }
            break;
        case 'PUT':
            try {
                const { title, content } = req.body;
                const updatedPost = await Post.findByIdAndUpdate(id, { title, content }, { new: true });
                if (!updatedPost) return res.status(404).json({ message: 'Post not found' });
                res.status(200).json(updatedPost);
            } catch (error) {
                res.status(500).json({ message: 'Error updating post', error });
            }
            break;
        case 'DELETE':
            try {
                const deletedPost = await Post.findByIdAndDelete(id);
                if (!deletedPost) return res.status(404).json({ message: 'Post not found' });
                res.status(200).json({ message: 'Post deleted successfully' });
            } catch (error) {
                res.status(500).json({ message: 'Error deleting post', error });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}