import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';

import dbConnect from '../../../lib/dbConnect.js'; // .js 추가
import MemberBasic from "../../../models/MemberBasic.js";

import { serialize } from 'cookie';
import {createSession} from "../lib/sessionStore.js";


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
                if (!memberInfos.authorEmail || !memberInfos.password) {
                    return res.status(400).json({ message: 'email and password required' });
                }

                // 1) 사용자 조회
                const existingMember = await MemberBasic.findOne({authorEmail: memberInfos.authorEmail, delYn: false});

                if (!existingMember) {
                    return res.status(400).json({message: 'Member not found'});
                }

                // 2) 비밀번호 비교(회원가입 시 해시 저장 전제)
                const ok = await bcrypt.compare(memberInfos.password, existingMember.password);
                if (!ok) return res.status(401).json({ message: 'password not matched' });

                // 3) 세션 생성
                const sessionId = await createSession({ uid: existingMember.uid, email: existingMember.authorEmail });

                // 4) HttpOnly 세션 쿠키 설정
                const cookie = serialize('sid', sessionId, {
                    httpOnly: true,
                    secure: true,           // HTTPS 환경에서 true
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7, // 7일(예시)
                });
                res.setHeader('Set-Cookie', cookie);


                return res.status(200).json({ uid: existingMember.uid, email: existingMember.authorEmail });

            } catch (error) {
                res.status(500).json({ message: 'Error update member', error });
            }
            break;
        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}