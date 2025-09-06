import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from '../../lib/dbConnect.js'; // .js 추가
import Post from '../../models/Post.js';       // .js 추가
import MemberBasic from '../../models/MemberBasic.js';
import { parse } from 'cookie';
import { getSession } from '../members/lib/sessionStore.js';

type MeLean = { uid: number; nName: string };

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
                // 세션 확인
                const cookies = parse(req.headers.cookie ?? '');
                const sid = cookies['sid'];
                if (!sid) return res.status(401).json({ message: 'Unauthorized' });

                const session = await getSession(sid);
                if (!session) return res.status(401).json({ message: 'Unauthorized' });

                // 사용자 닉네임 조회
                // 필요한 필드만 select하고 lean에 제네릭으로 타입 지정
                const me = await MemberBasic.findOne({ uid: session.uid, delYn: false }).lean<MeLean | null>();
                if (!me) return res.status(401).json({ message: 'Unauthorized' });

                const { title, content } = req.body ?? {};
                if (!title || !content) {
                    return res.status(400).json({ message: 'title and content required' });
                }

                // authorName = nName, authorUid 저장
                const newPost = await Post.create({
                    title,
                    content,
                    nName: me.nName,
                    uid: me.uid,
                });

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