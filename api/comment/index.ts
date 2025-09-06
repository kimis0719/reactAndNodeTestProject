import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from '../../lib/dbConnect.js';
import Comment from '../../models/Comment.js';
import MemberBasic from '../../models/MemberBasic.js';
import { parse } from 'cookie';
import { getSession } from '../members/lib/sessionStore.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        // 세션 확인
        const cookies = parse(req.headers.cookie ?? '');
        const sid = cookies['sid'];
        if (!sid) return res.status(401).json({ message: 'Unauthorized' });

        const session = await getSession(sid);
        if (!session) return res.status(401).json({ message: 'Unauthorized' });

        // 작성자 닉네임/UID 조회
        const me = await MemberBasic.findOne({ uid: session.uid, delYn: false })
          .select('uid nName')
          .lean<{ uid: number; nName: string } | null>();
        if (!me) return res.status(401).json({ message: 'Unauthorized' });

        const { postId, upperCommentId = null, content } = req.body ?? {};
        if (!postId || !content) {
          return res.status(400).json({ message: 'postId and content required' });
        }

        const created = await Comment.create({
          postId,
          upperCommentId,
          content,
          nName: me.nName, // 닉네임 저장
          uid: me.uid,    // 작성자 UID 저장
        });

        res.status(201).json(created);
      } catch (error) {
        res.status(500).json({ message: 'Error creating comment', error });
      }
      break;

    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}