// server/src/models/Post.ts
import mongoose, { Document, Schema } from 'mongoose';

// TypeScript에서 사용할 Post 문서의 인터페이스
export interface IPost extends Document {
    title: string;
    content: string;
    authorEmail: string;
    like: Number;
    viewCount: Number;
}

// Mongoose 스키마 정의
const PostSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        nName: { type: String, required: true },
        uid: { type: Number, required: true },
        like: { type: Number, required: false, default: 0 },
        viewCount: { type: Number, required: false, default: 0 },
    },
    {
        timestamps: true, // createdAt, updatedAt 자동 기록
    }
);

// 모델 생성 및 내보내기
export default mongoose.model<IPost>('Post', PostSchema);