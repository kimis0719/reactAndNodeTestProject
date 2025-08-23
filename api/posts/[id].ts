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
                // ID로 문서를 찾아서 viewCount 필드를 1 증가시키고, 업데이트된 문서를 반환받는다.
                const post = await Post.findByIdAndUpdate(
                    id,
                    { $inc: { viewCount: 1 } }, // '$inc'를 사용해 'viewCount' 필드를 1 증가
                    { new: true } // 이 옵션을 줘야 업데이트 '후'의 문서를 반환함
                );
                if (!post) return res.status(404).json({ message: 'Post not found' });

                res.status(200).json(post);
            } catch (error) {
                res.status(500).json({ message: 'Error fetching post', error });
            }
            break;
        case 'PUT':
            try {
                const { title, content, authorEmail } = req.body;
                const updatedPost = await Post.findByIdAndUpdate(id, { title, content, authorEmail}, { new: true });
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