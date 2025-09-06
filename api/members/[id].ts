import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from '../../lib/dbConnect.js'; // .js 추가
import MemberBasic from "../../models/MemberBasic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await dbConnect();

    const { method } = req;
    const { uid } = req.query;

    if (!uid) {
        return res.status(400).json({ message: 'uid is required' });
    }

    switch (method) {
        case 'GET':
            try {
                // uid GET -> 회원의 UID 를 기준으로 삭제되지 않은 정보 조회
                const memberInfo = await MemberBasic.find({ uid: uid, delYn: false }).sort({ createdAt: 1 }).lean();
                const outputInfo = {
                    uid: memberInfo[0].uid,
                    nName: memberInfo[0].nName,
                    mblNo: memberInfo[0].mblNo,
                    authorEmail: memberInfo[0].authorEmail,
                    password: memberInfo[0].password, // FIXME :: 미노출 예정
                    delYn: memberInfo[0].delYn,
                    createdAt: memberInfo[0].createdAt,
                    updatedAt: memberInfo[0].updatedAt,
                }
                return res.status(200).json(memberInfo ?? []);
            } catch (error) {
                res.status(500).json({ message: 'Error fetching memberInfo', error });
            }
            break;
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}