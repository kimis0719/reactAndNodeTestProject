import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from '../../../lib/dbConnect.js'; // .js 추가
import MemberBasic from "../../../models/MemberBasic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await dbConnect();

    const { method } = req;
    // const { uid } = req.query;
    const { memberInfos } = req.body ?? {};

    if (!memberInfos) {
        return res.status(400).json({ message: 'memberInfos is required' });
    }

    switch (method) {
        case 'POST':
            try {
                // uid POST - 회원 탈퇴 (삭제 x 회원탈퇴여부 o)
                const existingMember = await MemberBasic.findOne({uid: memberInfos.uid});

                if (!existingMember) {
                    return res.status(400).json({message: 'Member not found'});
                }


                if (!memberInfos.authorEmail && !memberInfos.password &&
                    memberInfos.authorEmail !== existingMember.authorEmail &&
                    memberInfos.password !== existingMember.password) {
                    return res.status(400).json({message: 'authorEmail or password are not matched'});
                }

                const withdrawMember = await MemberBasic.findOneAndUpdate(
                    {uid: memberInfos.uid},
                    {$set: {delYn: true}},
                    {new: true}
                );

                return res.status(200).json(withdrawMember);

            } catch (error) {
                res.status(500).json({ message: 'Error delete member', error });
            }
            break;
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}