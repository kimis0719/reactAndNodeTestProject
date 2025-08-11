import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PostForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
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
        await axios.put(`/api/posts/${id}`, postData);
      } else {
        await axios.post('/api/posts', postData);
      }
      navigate('/');
    } catch (error) {
      console.error('Error submitting post', error);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h2 className="mb-4 text-2xl font-bold dark:text-gray-100">
        {id ? '글 수정하기' : '새 글 작성하기'}
      </h2>

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
    </div>
  );
};

export default PostForm;