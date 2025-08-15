import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PostForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isViewMode = location.pathname.includes('/posts/');

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        const response = await axios.get(`/api/posts/${id}`);
        setTitle(response.data.title);
        setContent(response.data.content);
        setCreatedAt(response.data.createdAt);
      };
      fetchPost();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const postData = { title, content };

    try {
      if (id) {
        await axios.put(`/api/posts/${id}`, postData);
      } else {
        await axios.post('/api/posts', postData);
      }
      navigate('/');
    } catch (error) {
      console.error('Error submitting post', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/api/posts/${id}`);
        navigate(-1); // 이전페이지로 이동
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
            <div className="space-y-5 rounded-xl border border-gray-200 p-5 dark:border-gray-700 dark:bg-gray-800">
              <div>
                <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">{title}</p>
                <small className="text-xs text-gray-500 dark:text-gray-400">
                  작성일: {new Date(createdAt ?? '' ).toLocaleDateString()}
                </small>
              </div>
              <div>
                {/* whitespace-pre-wrap 클래스로 줄바꿈 유지 */}
                <p className="mt-1 whitespace-pre-wrap text-gray-800 dark:text-gray-200">{content}</p>
              </div>
              {/* 1. justify-between 클래스 추가  - 버튼정렬*/}
              <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                {/* 왼쪽에 위치할 '뒤로가기' 버튼 */}
                <button
                    type="button"
                    onClick={() => navigate(-1)} // 이전 페이지로 이동
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  뒤로가기
                </button>

                {/* 2. 오른쪽에 위치할 버튼들을 div로 그룹화 */}
                <div className="flex items-center gap-2">
                  <button
                      type="button"
                      onClick={() => navigate(`/edit/${id}`)} // 수정 페이지로 이동
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                  >
                    수정
                  </button>
                  <button
                      onClick={() => handleDelete()}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900"
                      type="button"
                  >
                    삭제
                  </button>
                </div>
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