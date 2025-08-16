import express from 'express';
import type { Request, Response } from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url'; // pathToFileURL 추가
import fs from 'fs';
import dotenv from 'dotenv';

// .env.local 파일을 먼저 로드합니다.
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const app = express();
const port = 4000; // API 서버는 4000번 포트를 사용

app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.join(__dirname, 'api');

// api 폴더의 모든 파일을 읽어서 동적으로 라우트를 생성합니다.
const registerRoutes = async (dir: string, prefix = '') => {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            await registerRoutes(fullPath, `${prefix}/${file.name}`);
        } else if (file.name.endsWith('.ts')) {
            let routePath = `${prefix}/${file.name.replace(/\.ts$/, '')}`;

            // index.ts -> /
            routePath = routePath.replace(/\/index$/, '');
            // [id].ts -> /:id
            routePath = routePath.replace(/\[(\w+)\]/g, ':$1');

            if (routePath === '') routePath = '/';

            try {
                // 윈도우 경로를 file:// URL로 변환합니다.
                const moduleUrl = pathToFileURL(fullPath).href;
                const module = await import(moduleUrl);

                if (module.default && typeof module.default === 'function') {
                    console.log(`✅ Route registered: ${routePath}`);
                    app.all(routePath, (req: Request, res: Response) => {
                        // Vercel 환경을 시뮬레이션하기 위해 Express의 req.params를 req.query에 복사합니다. (핵심 수정!)
                        req.query = { ...req.query, ...req.params };

                        // Vercel 핸들러를 Express 요청/응답 객체로 실행합니다.
                        module.default(req, res);
                    });
                }
            } catch (error) {
                console.error(`❌ Failed to register route for ${fullPath}:`, error);
            }
        }
    }
};

const startServer = async () => {
    await registerRoutes(apiDir, '/api');

    createServer(app).listen(port, () => {
        console.log(`🚀 Fast API server is running at http://localhost:${port}`);
    });
};

startServer();
