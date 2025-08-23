import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 댓글 입력 폼 컴포넌트
const InlineCommentForm: React.FC<{
    postId: string;
    upperCommentId?: string | null;
    onSubmitted: () => void;
    onCancel?: () => void;
}> = ({ postId, upperCommentId, onSubmitted, onCancel }) => {
    const [content, setContent] = useState('');
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storedUser) {
            alert('댓글을 작성하려면 로그인이 필요합니다.');
            return;
        }
        const user = JSON.parse(storedUser);
        const authorEmail = user.email;
        try {
            await axios.post(`/api/comment`, {
               // 항상 부모로부터 받은 postId를 사용
               postId,
               // 대댓글이면 부모 댓글 ID, 최상위면 null
               upperCommentId: upperCommentId ?? null,
                content,
                authorEmail,
            });
            setContent('');
            onSubmitted();
        } catch (err) {
            console.error(err);
            alert('댓글 저장 중 오류가 발생했습니다.');
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