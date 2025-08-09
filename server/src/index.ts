import express from 'express';
import type { Request, Response } from 'express'; // 'Request'와 'Response'는 타입이므로 `import type` 사용
import cors from 'cors';
import mongoose from 'mongoose'; // mongoose 임포트
import dotenv from 'dotenv'; // dotenv 임포트
import postRoutes from './routes/postRoutes'; // 라우터 임포트

dotenv.config(); // .env 파일의 환경 변수를 불러옴

const app = express();
const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGO_URI; // .env에서 MONGO_URI 가져오기

// --- MongoDB 연결 ---
if (!mongoUri) {
    console.error("MONGO_URI is not defined in .env file");
    process.exit(1); // MONGO_URI가 없으면 서버 실행 중단
}

mongoose.connect(mongoUri)
    .then(() => console.log('Successfully connected to MongoDB'))
    .catch(e => console.error(e));
// --------------------

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API 라우터 연결 ---
app.use('/api/posts', postRoutes); // '/api/posts' 경로로 오는 요청은 postRoutes가 처리

app.get('/api', (req: Request, res: Response) => {
    res.send('Hello from Express Server!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});