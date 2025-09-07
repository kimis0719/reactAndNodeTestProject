import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from '../../../lib/dbConnect.js'; // .js 추가
import MemberBasic from "../../../models/MemberBasic.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await dbConnect();

    const { method } = req;

    const rawBody = req.body ?? {};
    const memberInfos = rawBody.memberInfos ?? rawBody;

    if (!memberInfos) {
        return res.status(400).json({ message: 'memberInfos is required' });
    }

    switch (method) {
        case 'POST':
            try {
                // uid POST - 회원 정보 수정 FIXME :: 닉네임, 휴대폰번호만 우선 수정가능 - 패스워드는 나중에 개발예정
                const existingMember = await MemberBasic.findOne({uid: memberInfos.uid, delYn: false});

                if (!existingMember) {
                    return res.status(400).json({message: 'Member not found'});
                }

                if (!memberInfos.authorEmail && !memberInfos.password &&
                    memberInfos.authorEmail !== existingMember.authorEmail &&
                    memberInfos.password !== existingMember.password) {
                    return res.status(400).json({message: 'authorEmail or password are not matched'});
                }

                const updateData: { nName?: string; mblNo?: number } = {};
                if (memberInfos.nName) updateData.nName = memberInfos.nName;
                if (memberInfos.mblNo) updateData.mblNo = memberInfos.mblNo;

                const updatedMember = await MemberBasic.findOneAndUpdate(
                    {uid: memberInfos.uid},
                    {$set: updateData},
                    {new: true}
                );

                return res.status(200).json(updatedMember);


            } catch (error) {
                res.status(500).json({ message: 'Error update member', error });
            }
            break;
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}