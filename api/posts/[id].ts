import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from '../../lib/dbConnect.js';
import Post from '../../models/Post.js';
import { parse } from 'cookie';
import { getSession } from '../members/lib/sessionStore.js';

type MeLean = { uid: number; nName: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await dbConnect();

  const { method } = req;
  const { id } = req.query;

  switch (method) {
    case 'GET':
      try {
        const post = await Post.findByIdAndUpdate(
          id,
          { $inc: { viewCount: 1 } },
          { new: true }
        );
        if (!post) return res.status(404).json({ message: 'Post not found' });

        res.status(200).json(post);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching post', error });
      }
      break;

    case 'PUT':
      try {
        const cookies = parse(req.headers.cookie ?? '');
        const sid = cookies['sid'];
        if (!sid) return res.status(401).json({ message: 'Unauthorized' });

        const session = await getSession(sid);
        if (!session) return res.status(401).json({ message: 'Unauthorized' });

        const existing = await Post.findById(id).lean<MeLean | null>();
        if (!existing) return res.status(404).json({ message: 'Post not found' });

        // 작성자 본인인지 확인
        if (existing.uid !== session.uid) {
          return res.status(403).json({ message: 'Forbidden' });
        }

        const { title, content } = req.body ?? {};
        const updatedPost = await Post.findByIdAndUpdate(
          id,
          { title, content },
          { new: true }
        );
        if (!updatedPost) return res.status(404).json({ message: 'Post not found' });
        res.status(200).json(updatedPost);
      } catch (error) {
        res.status(500).json({ message: 'Error updating post', error });
      }
      break;

    case 'DELETE':
      try {
        const cookies = parse(req.headers.cookie ?? '');
        const sid = cookies['sid'];
        if (!sid) return res.status(401).json({ message: 'Unauthorized' });

        const session = await getSession(sid);
        if (!session) return res.status(401).json({ message: 'Unauthorized' });

        const existing = await Post.findById(id).lean<MeLean | null>();
        if (!existing) return res.status(404).json({ message: 'Post not found' });

        if (existing.uid !== session.uid) {
          return res.status(403).json({ message: 'Forbidden' });
        }

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