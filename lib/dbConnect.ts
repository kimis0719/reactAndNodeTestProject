import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path'; // path 모듈을 사용하기 위해 추가

// 프로젝트 루트를 기준으로 .env.local 파일의 절대 경로를 찾습니다.
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });


const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error(`치명적 에러: ${envPath} 경로에서 MONGODB_URI를 찾을 수 없거나 읽을 수 없습니다.`);
    // 앱을 강제 종료하여 문제가 있음을 확실히 알립니다.
    process.exit(1);
}

let cached = (globalThis as any).mongoose;

if (!cached) {
    cached = (globalThis as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000
        };
        // MONGODB_URI 뒤에 !를 추가하여, 이 변수가 절대 null이나 undefined가 아님을 타입스크립트에게 알려줍니다.
        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            console.log('MongoDB 연결에 성공했습니다!');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
