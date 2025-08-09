// client/src/components/Board.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Link 임포트

// 게시글 데이터의 타입을 정의
interface Post {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
}

const Board = () => {
    // 게시글 목록, 로딩 상태, 에러 상태를 관리하는 state
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // 프록시 설정 덕분에 '/api/posts'만 적어도 서버로 요청이 전달됨
                const response = await axios.get<Post[]>('/api/posts');
                setPosts(response.data); // 받아온 데이터로 state 업데이트
            } catch (err) {
                setError('게시글을 불러오는 데 실패했습니다.');
                console.error(err);
            } finally {
                setLoading(false); // 로딩 종료
            }
        };

        fetchPosts();
    }, []); // []를 비워두면 컴포넌트가 처음 렌더링될 때 한 번만 실행

    // ▼▼▼▼▼ handleDelete 함수 추가 ▼▼▼▼▼
    const handleDelete = async (id: string) => {
        if (window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
            try {
                await axios.delete(`/api/posts/${id}`);
                // 상태 업데이트: 삭제된 게시글을 목록에서 제거
                setPosts(posts.filter((post) => post._id !== id));
            } catch (error) {
                console.error('Error deleting post', error);
            }
        }
    };

    // 로딩 중일 때 보여줄 화면
    if (loading) {
        return <div>로딩 중...</div>;
    }

    // 에러 발생 시 보여줄 화면
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>게시판</h2>
            {/* ▼▼ 글쓰기 버튼 추가 ▼▼ */}
            <Link to="/write">
                <button>글쓰기</button>
            </Link>

            {posts.length === 0 ? (
                <p>아직 게시글이 없습니다.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {posts.map((post) => (
                        <li key={post._id} style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>
                            <h3>{post.title}</h3>
                            <p>{post.content}</p>
                            <small>작성일: {new Date(post.createdAt).toLocaleDateString()}</small>
                            <div style={{ marginTop: '10px' }}>
                                {/* ▼▼ 수정, 삭제 버튼 추가 ▼▼ */}
                                <Link to={`/edit/${post._id}`}>
                                    <button style={{ marginRight: '5px' }}>수정</button>
                                </Link>
                                <button onClick={() => handleDelete(post._id)}>삭제</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};



export default Board;