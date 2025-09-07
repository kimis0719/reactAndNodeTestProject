import type { VercelRequest, VercelResponse } from '@vercel/node';
import dbConnect from '../../lib/dbConnect.js'; // .js 추가
import MemberBasic from "../../models/MemberBasic.js";

// IMember 인터페이스를 이 파일에 직접 정의
interface IMember {
    uid: string;
    nName: string;
    mblNo: string;
    authorEmail: string;
    delYn: boolean;
    createdAt: Date;
    updatedAt: Date;
    // Mongoose 모델의 다른 필드들도 여기에 추가할 수 있어.
}


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
                // 1. 회원의 UID를 기준으로 삭제되지 않은 정보 조회
                const memberInfo = await MemberBasic.findOne({ uid: uid, delYn: false }).lean<IMember>();

                // 2. memberInfo가 없으면(null이면) 여기서 404 응답을 보내고 함수를 끝냄
                if (!memberInfo) {
                    return res.status(404).json({ message: '회원 정보를 찾을 수 없습니다.' });
                }

                // 3. 위 if 문을 통과하면, TypeScript는 memberInfo가 절대 null이 아니라고 확신함.
                //    따라서 더 이상 'possibly null' 에러가 발생하지 않아.
                const outputInfo = {
                    uid: memberInfo.uid,
                    nName: memberInfo.nName,
                    mblNo: memberInfo.mblNo,
                    authorEmail: memberInfo.authorEmail,
                    // password: memberInfo.password, // 보안을 위해 비밀번호는 아예 제외하는 것이 좋음
                    delYn: memberInfo.delYn,
                    createdAt: memberInfo.createdAt,
                    updatedAt: memberInfo.updatedAt,
                };

                // 4. (버그 수정) 원래 코드에서는 outputInfo를 만들어놓고 memberInfo를 보내고 있었어.
                //    수정된 정보인 outputInfo를 보내도록 수정했어.
                return res.status(200).json(outputInfo);

            } catch (error) {
                res.status(500).json({ message: 'Error fetching memberInfo', error });
            }
            break;
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}