import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PostForm = () => {
  // 게시글 관련
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const { id } = useParams<{ id: string }>();

  //페이지 이동시 사용
  const navigate = useNavigate();

  // 요청에 posts 이 있으면 보기모드로 인식
  const isViewMode = location.pathname.includes('/posts/');

  // 사용자정보
  // localStorage에서 'user'라는 키로 저장된 데이터를 가져옴
  const storedUser = localStorage.getItem('user');
  let isAuthor = false;

  // 보기모드면서, 로그인정보가 있다면 작성자여부 체크
  if(isViewMode && storedUser !== null) {
    isAuthor = JSON.parse(storedUser).email === authorEmail || JSON.parse(storedUser).email === 'admin@naver.com' ;
  }

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        const response = await axios.get(`/api/posts/${id}`);
        setTitle(response.data.title);
        setContent(response.data.content);
        setAuthorEmail(response.data.authorEmail);
        setCreatedAt(response.data.createdAt);
      };
      fetchPost();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storedUser) {
      alert('글을 작성하려면 로그인이 필요합니다.');
      return;
    }
    const user = JSON.parse(storedUser);
    const authorEmail = user.email;

    try {
      if (id) {
        const postData = { title, content};
        await axios.put(`/api/posts/${id}`, postData);
      } else {
        const postData = { title, content, authorEmail};
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
        navigate('/'); // 메인페이지로 이동
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
                  <span className="text-sm  dark:text-gray-500">{authorEmail}</span>
                </div>

                {/* 작성일자는 그 아래 줄에 */}
                <small className="text-xs dark:text-gray-400">
                  작성일: {new Date(createdAt ?? '').toLocaleDateString()}
                </small>
              </div>

              <div>
                <p className="mt-1 whitespace-pre-wrap  dark:text-gray-200">{content}</p>
              </div>

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