import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get<Post[]>('/api/posts');
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

  const handleDelete = async (id: string) => {
    if (window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/api/posts/${id}`);
        setPosts((prev) => prev.filter((post) => post._id !== id));
      } catch (error) {
        console.error('Error deleting post', error);
      }
    }
  };

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
                  <li key={post._id} className="p-4 sm:p-5">
                      <h3 className="text-lg font-semibold dark:text-gray-100">{post.title}</h3>
                      <p className="mt-2 text-sm leading-6 dark:text-gray-300">
                          {post.content}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <small className="text-xs text-gray-500 dark:text-gray-400">
                              작성일: {new Date(post.createdAt).toLocaleDateString()}
                          </small>
                          <div className="flex items-center gap-2">
                              <Link to={`/edit/${post._id}`}>
                                  <button
                                      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-blue-900"
                                      type="button"
                                  >
                                      수정
                                  </button>
                              </Link>
                              <button
                                  onClick={() => handleDelete(post._id)}
                                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900"
                                  type="button"
                              >
                                  삭제
                              </button>
                          </div>
                      </div>
                  </li>
              ))}
          </ul>
      )}
    </div>
  );
};

export default Board;