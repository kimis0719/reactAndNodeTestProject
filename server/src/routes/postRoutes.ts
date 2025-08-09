// server/src/routes/postRoutes.ts
import { Router, Request, Response } from 'express';
import Post from '../models/Post'; // 방금 만든 Post 모델 임포트

const router = Router();

// [POST] /api/posts - 새 게시글 생성
router.post('/', async (req: Request, res: Response) => {
    try {
        const { title, content } = req.body;
        const newPost = new Post({ title, content });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error });
    }
});

// [GET] /api/posts - 모든 게시글 조회
router.get('/', async (req: Request, res: Response) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); // 최신순으로 정렬
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
    }
});


// [GET] /api/posts/:id - 특정 게시글 조회
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching post', error });
    }
});

// [PUT] /api/posts/:id - 특정 게시글 수정
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { title, content } = req.body;
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { title, content },
            { new: true } // 업데이트된 문서를 반환
        );
        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Error updating post', error });
    }
});

// [DELETE] /api/posts/:id - 특정 게시글 삭제
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error });
    }
});

export default router;