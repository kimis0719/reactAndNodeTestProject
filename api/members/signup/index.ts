import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from '../../../lib/dbConnect.js'; // .js 추가
import MemberBasic from "../../../models/MemberBasic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await dbConnect();

    const { method } = req;

    const { memberInfos } = req.body ?? {};
    if (!memberInfos) {
        return res.status(400).json({ message: 'memberInfos is required to add member' });
    }

    switch (method) {
        case 'PUT':
            try {
                // uid PUT - 회원 가입 TODO :: authorEmail 중복 체크
                if (!memberInfos.authorEmail || !memberInfos.password) {
                    return res.status(400).json({message: 'uid, authorEmail, and password are required'});
                }

                const newMember = await MemberBasic.create(memberInfos);

                if (!newMember) {
                    return res.status(500).json({message: 'Failed to create member'});
                }
                return res.status(201).json(newMember);

            } catch (error) {
                res.status(500).json({ message: 'Error add member', error });
            }
            break;
        default:
            res.setHeader('Allow', ['PUT']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}