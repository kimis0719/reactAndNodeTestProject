// server/src/models/Post.ts
import mongoose, { Document, Schema } from 'mongoose';

// TypeScript에서 사용할 Post 문서의 인터페이스
export interface IComment extends Document {
    postId: string;
    upperCommentId: string;
    content: string;
    nName: string;
    uid: number;
}

// Mongoose 스키마 정의
const CommentSchema: Schema = new Schema(
    {
        postId: { type: String, required: true },
        upperCommentId: { type: String, required: false },
        content: { type: String, required: true },
        nName: { type: String, required: true },
        uid: { type: Number, required: true },
    },
    {
        timestamps: true, // createdAt, updatedAt 자동 기록
    }
);

// 모델 생성 및 내보내기
export default mongoose.model<IComment>('Comment', CommentSchema);