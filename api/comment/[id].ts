import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from '../../lib/dbConnect.js';
import Comment from '../../models/Comment.js';
import { parse } from 'cookie';
import { getSession } from '../members/lib/sessionStore.js';

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
        res.status(500).json({ message: 'Error fetching comments', error });
      }
      break;

    case 'PUT':
      try {
        // 인증
        const cookies = parse(req.headers.cookie ?? '');
        const sid = cookies['sid'];
        if (!sid) return res.status(401).json({ message: 'Unauthorized' });
        const session = await getSession(sid);
        if (!session) return res.status(401).json({ message: 'Unauthorized' });

        // 여기의 id는 "댓글 id"
        const { content } = req.body ?? {};
        if (!content) {
          return res.status(400).json({ message: 'content is required to update comment' });
        }

        const existing = await Comment.findById(id);
        if (!existing) return res.status(404).json({ message: 'Comment not found' });

        // 작성자 본인만 수정 가능
        if (existing.uid !== session.uid) {
          return res.status(403).json({ message: 'Forbidden' });
        }

        existing.content = content;
        const updated = await existing.save();
        return res.status(200).json(updated);
      } catch (error) {
        res.status(500).json({ message: 'Error updating comment', error });
      }
      break;

    case 'DELETE':
      try {
        // 인증
        const cookies = parse(req.headers.cookie ?? '');
        const sid = cookies['sid'];
        if (!sid) return res.status(401).json({ message: 'Unauthorized' });
        const session = await getSession(sid);
        if (!session) return res.status(401).json({ message: 'Unauthorized' });

        // 여기의 id는 "댓글 id"
        const existing = await Comment.findById(id);
        if (!existing) return res.status(404).json({ message: 'Comment not found' });

        // 작성자 본인만 삭제 가능
        if (existing.uid !== session.uid) {
          return res.status(403).json({ message: 'Forbidden' });
        }

        await Comment.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Comment deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}