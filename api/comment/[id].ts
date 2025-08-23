import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from '../../lib/dbConnect.js'; // .js 추가
import Post from '../../models/Post.js';       // .js 추가
import Comment from '../../models/Comment.js';       // .js 추가

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await dbConnect();

    const { method } = req;
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'id is required' });
    }

    switch (method) {
        case 'GET':
            try {
                // id를 postId로 간주: 해당 포스트의 모든 댓글 목록
                const comments = await Comment.find({ postId: id }).sort({ createdAt: 1 }).lean();
                return res.status(200).json(comments ?? []);
            } catch (error) {
                res.status(500).json({ message: 'Error fetching Comment', error });
            }
            break;
        case 'PUT':
            try {
                // 주의: 여기의 id는 "댓글 id"일 때만 정상 동작합니다.
                const { content } = req.body ?? {};
                if (!content) {
                    return res.status(400).json({ message: 'content is required to update comment' });
                }
                const updated = await Comment.findByIdAndUpdate(id, { content }, { new: true });
                if (!updated) {
                    return res.status(404).json({ message: 'Comment not found' });
                }
                return res.status(200).json(updated);

            } catch (error) {
                res.status(500).json({ message: 'Error updating post', error });
            }
            break;
        case 'DELETE':
            try {
                // const deletedPost = await Post.findByIdAndDelete(id);
                // if (!deletedPost) return res.status(404).json({ message: 'Post not found' });
                // res.status(200).json({ message: 'Post deleted successfully' });
            } catch (error) {
                // res.status(500).json({ message: 'Error deleting post', error });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}