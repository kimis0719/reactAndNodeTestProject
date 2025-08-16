import { useState, useEffect } from 'react';
import axios from 'axios';
import {Link, useParams} from 'react-router-dom';

interface Post {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
}

const Board = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { id }  = useParams<{ id: string }>();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get<Post[]>('/api/posts');
                // 이 로그를 추가해봐!
                console.log('서버로부터 받은 데이터:', response.data);
                setPosts(response.data);
            } catch (err) {
                setError('게시글을 불러오는 데 실패했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl p-4">
                <div className="space-y-3">
                    <div className="h-7 w-32 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    <div className="h-10 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    <div className="h-24 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    <div className="h-24 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    <div className="h-24 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-4xl p-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl p-4">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold dark:text-gray-100">게시판</h2>
                <Link to="/write">
                    <button
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-900"
                        type="button"
                    >
                        글쓰기
                    </button>
                </Link>
            </div>

            {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 p-10 text-center dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    <div className="text-3xl">📝</div>
                    <p className="text-sm">아직 게시글이 없습니다.</p>
                </div>
            ) : (
                <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
                    {posts.map((post) => (
                        <li key={post._id} className="transition-colors hover:bg-gray-400 dark:hover:bg-gray-900">
                            {post._id === id ? (
                                <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
                                    <h3 className="text-lg font-semibold dark:text-gray-100">{post.title}</h3>
                                    <small className="text-xs text-gray-500 dark:text-gray-400">
                                        작성일: {new Date(post.createdAt).toLocaleDateString()}
                                    </small>
                                </div>
                            ) : (
                                <Link to={`/posts/${post._id}`} className="block p-4 sm:p-5">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <h3 className="text-lg font-semibold dark:text-gray-100">{post.title}</h3>
                                        <small className="text-xs text-gray-500 dark:text-gray-400">
                                            작성일: {new Date(post.createdAt).toLocaleDateString()}
                                        </small>
                                    </div>
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Board;