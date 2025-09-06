// TypeScript
// models/Session.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
    _id: string;             // 세션 ID (문자열)
    uid: number;
    email: string;
    createdAt: Date;
    expiresAt: Date;         // TTL 인덱스 대상
}

const SessionSchema = new Schema<ISession>({
    _id: { type: String, required: true },
    uid: { type: Number, required: true },
    email: { type: String, required: true },
    createdAt: { type: Date, required: true, default: () => new Date() },
    expiresAt: { type: Date, required: true },
});

// TTL 인덱스: expiresAt 시각이 지나면 문서 자동 제거
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Session ||
mongoose.model<ISession>('Session', SessionSchema);