import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CommentSection from '../components/CommentSection.js';

const api = axios.create({
    withCredentials: true, // 세션 쿠키 전송
});

type MeResponse =
    | { authenticated: false }
    | { authenticated: true; user: { uid: number; email: string; nName?: string } };

const PostForm = () => {
    // 게시글 관련
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [nName, setNName] = useState(''); // nName으로 표시
    const [createdAt, setCreatedAt] = useState<Date | null>(null);
    const [viewCount, setviewCount] = useState(0);
    const [uid, setUid] = useState<number | null>(null);

    const [me, setMe] = useState<{ uid: number; email: string; nName?: string } | null>(null);
    const [loadingMe, setLoadingMe] = useState(true);

    const { id } = useParams<{ id: string }>();

    //페이지 이동시 사용
    const navigate = useNavigate();

    // 요청에 posts 이 있으면 보기모드로 인식
    const isViewMode = location.pathname.includes('/posts/');

    // 로그인 상태 로드
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoadingMe(true);
                const { data } = await api.get<MeResponse>('/api/members/logme');
                if (!mounted) return;
                if (data.authenticated) setMe(data.user);
                else setMe(null);
            } catch {
                if (mounted) setMe(null);
            } finally {
                if (mounted) setLoadingMe(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (id) {
            const fetchPost = async () => {
                const response = await api.get(`/api/posts/${id}`);
                setTitle(response.data.title);
                setContent(response.data.content);
                setNName(response.data.nName ?? 'ㅇㅇ');
                setUid(response.data.uid ?? null);
                setCreatedAt(response.data.createdAt);
                setviewCount(response.data.viewCount);
            };
            fetchPost();
        }
    }, [id]);

    const isAuthor = !!(me && uid && me.uid === uid);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loadingMe) return;
        if (!me) {
            alert('글을 작성하려면 로그인이 필요합니다.');
            return;
        }

        try {
            if (id) {
                const postData = { title, content};
                await api.put(`/api/posts/${id}`, postData);
            } else {
                const postData = { title, content};
                await api.post('/api/posts', postData);
            }
            navigate('/');
        } catch (error) {
            console.error('Error submitting post', error);
            alert('게시글 저장에 실패했습니다.');
        }
    };

    const handleDelete = async () => {
        if (!isAuthor) {
            alert('삭제 권한이 없습니다.');
            return;
        }
        if (window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
            try {
                await api.delete(`/api/posts/${id}`);
                navigate('/');
            } catch (error) {
                console.error('Error deleting post', error);
            }
        }
    };

    return (
        <div className="mx-auto max-w-3xl p-4">
            <h2 className="mb-4 text-2xl font-bold dark:text-gray-100">
                {isViewMode ? '글 상세보기' : id ? '글 수정하기' : '새 글 작성하기'}
            </h2>
            {isViewMode ? (
                <div className="space-y-5 rounded-xl border  p-5 dark:border-gray-700 dark:bg-gray-800">
                    <div>
                        {/* 제목과 작성자를 한 줄에 배치하기 위한 div */}
                        <div className="flex items-center justify-between">
                            <p className="mt-1 text-lg dark:text-gray-100">{title}</p>
                            <span className="text-sm  dark:text-gray-500">{nName}</span>
                        </div>

                        {/* 작성일자는 그 아래 줄에 */}
                        <small className="text-xs dark:text-gray-400">
                            <span> 조회수 : {viewCount}</span>
                            작성일: {new Date(createdAt ?? '').toLocaleDateString()}
                        </small>
                    </div>

                    <div>
                        <p className="mt-1 whitespace-pre-wrap  dark:text-gray-200">{content}</p>
                    </div>

                    {/* 댓글 섹션 */}
                    {id && <CommentSection postId={id} />}

                    <div className="flex items-center justify-between border-t  pt-4 dark:border-gray-700">
                        {/* '뒤로가기' 버튼은 이미 다크 모드가 잘 적용되어 있음 */}
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            뒤로가기
                        </button>
                        {isAuthor? (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/edit/${id}`)}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                >
                                    수정
                                </button>

                                <button
                                    onClick={() => handleDelete()}
                                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:active:bg-red-700 dark:focus:ring-red-800"
                                    type="button"
                                >
                                    삭제
                                </button>
                            </div>
                        ):( <div></div>)}
                    </div>
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-xl border border-gray-200 p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                    <div>
                        <label
                            htmlFor="title"
                            className="mb-2 block text-sm font-medium dark:text-gray-300"
                        >
                            제목
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900"
                            placeholder="제목을 입력하세요"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="content"
                            className="mb-2 block text-sm font-medium dark:text-gray-300"
                        >
                            내용
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            rows={10}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900"
                            placeholder="내용을 입력하세요"
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            줄바꿈은 그대로 유지됩니다. 긴 텍스트도 편하게 입력하세요.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-900"
                        >
                            {id ? '수정 완료' : '작성 완료'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-blue-900"
                        >
                            취소
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default PostForm;