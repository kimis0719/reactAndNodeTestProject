// server/src/models/Post.ts
import mongoose, { Document, Schema, HydratedDocument} from 'mongoose';

// TypeScript에서 사용할 Post 문서의 인터페이스
export interface IMemberBasic extends Document {
    uid: number;
    authorEmail: string;
    password: string;
    nName: string;
    mblNo: number;
    memberType: string;
    delYn: boolean;
}

// 카운터 스키마/모델 (자동증가 시퀀스용)
const CounterSchema = new Schema(
    {
        _id: { type: String, required: true }, // 시퀀스 키 (예: 'member_uid')
        seq: { type: Number, required: true, default: 0 },
    },
    { versionKey: false }
);

const Counter =
    mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

// Mongoose 스키마 정의
const MemberBasicSchema: Schema = new Schema(
    {
        uid: { type: Number, required: true, unique: true }, // 고유식별번호(자동발급)
        authorEmail: { type: String, required: true }, // 로그인 이메일
        password: { type: String, required: true }, // 비밀번호 :: TODO :: 암호화
        nName: { type: String, required: false, default: 'ㅇㅇ' }, // 닉네임
        mblNo: { type: String, required: false}, // 핸드폰번호 - 선택
        memberType: { type: String, required: false, default: 'user' }, // 회원타입 - 유저, 파딱, 주딱, 관리자 등
        delYn: { type: Boolean, required: false, default: false}, // 회원탈퇴여부
    },
    {
        timestamps: true, // createdAt, updatedAt 자동 기록
    }
);

// 저장 전에 uid가 없으면 자동 증가값 발급
MemberBasicSchema.pre('validate', async function (this:HydratedDocument<IMemberBasic> ,next) {
    try {
        if (this.isNew && (this.uid === undefined || this.uid === null)) {
            const counter = await Counter.findOneAndUpdate(
                { _id: 'member_uid' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            ).lean<{ _id: string; seq: number } | null>();

            if (!counter) {
                return next(new Error('Failed to get next UID sequence'));
            }
            this.uid = counter.seq;
        }

        next();
    } catch (err) {
        next(err as Error);
    }
});

// 모델 생성 및 내보내기
export default mongoose.models.MemberBasic ||
mongoose.model<IMemberBasic>('MemberBasic', MemberBasicSchema);
