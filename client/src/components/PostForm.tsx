// client/src/components/PostForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PostForm = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const { id } = useParams<{ id: string }>(); // URL에서 id 파라미터를 가져옴 (수정 시)
    const navigate = useNavigate(); // 페이지 이동을 위한 hook

    useEffect(() => {
        // id가 존재하면 (수정 모드이면) 기존 게시글 데이터를 불러옴
        if (id) {
            const fetchPost = async () => {
                const response = await axios.get(`/api/posts/${id}`);
                setTitle(response.data.title);
                setContent(response.data.content);
            };
            fetchPost();
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const postData = { title, content };

        try {
            if (id) {
                // id가 있으면 수정(PUT) 요청
                await axios.put(`/api/posts/${id}`, postData);
            } else {
                // id가 없으면 생성(POST) 요청
                await axios.post('/api/posts', postData);
            }
            navigate('/'); // 성공 시 메인 페이지로 이동
        } catch (error) {
            console.error('Error submitting post', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{id ? '글 수정하기' : '새 글 작성하기'}</h2>
            <div>
                <label>제목:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px' }}
                />
            </div>
            <div style={{ marginTop: '10px' }}>
                <label>내용:</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={10}
                    style={{ width: '100%', padding: '8px' }}
                />
            </div>
            <button type="submit" style={{ marginTop: '10px' }}>
                {id ? '수정 완료' : '작성 완료'}
            </button>
        </form>
    );
};

export default PostForm;