import React, { useState } from 'react';
import axios from 'axios';

const api = axios.create({
  withCredentials: true, // 세션 쿠키 전송
});

// 댓글 입력 폼 컴포넌트
const InlineCommentForm: React.FC<{
  postId: string;
  upperCommentId?: string | null;
  onSubmitted: () => void;
  onCancel?: () => void;
}> = ({ postId, upperCommentId, onSubmitted, onCancel }) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post(`/api/comment`, {
        postId,
        upperCommentId: upperCommentId ?? null,
        content,
      });
      setContent('');
      onSubmitted();
    } catch (err: any) {
      const msg = err?.response?.data?.message || '댓글 저장 중 오류가 발생했습니다.';
      alert(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        required
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-900"
        placeholder="댓글을 입력하세요"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          등록
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
};

export default InlineCommentForm;