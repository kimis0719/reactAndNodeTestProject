import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import InlineCommentForm from '../components/InlineCommentForm.js';

const api = axios.create({
  withCredentials: true,
});

// 댓글 타입
interface IComment {
  _id: string;
  postId: string;
  upperCommentId?: string | null;
  content: string;
  nName: string;   // 변경: authorEmail -> nName
  uid: number;    // 추가: 작성자 UID
  createdAt?: string;
  updatedAt?: string;
}

// 단일 댓글 아이템(대댓글 포함)
const CommentItem: React.FC<{
  comment: IComment;
  replies: IComment[];
  allComments: IComment[];
  postId: string;
  onRefresh: () => void;
  depth?: number;
}> = ({ comment, replies, allComments, postId, onRefresh, depth = 0 }) => {
  const [isReplying, setIsReplying] = useState(false);

  const childReplies = allComments.filter((c) => c.upperCommentId === comment._id);

  return (
    <div className={`mt-3 ${depth > 0 ? 'ml-4 border-l pl-4 dark:border-gray-700' : ''}`}>
      <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-900/30">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {comment.nName}{' '}
            {comment.createdAt ? `· ${new Date(comment.createdAt).toLocaleString()}` : ''}
          </span>
        </div>
        <div className="whitespace-pre-wrap text-sm dark:text-gray-100">{comment.content}</div>
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setIsReplying((prev) => !prev)}
            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
          >
            댓글달기
          </button>
        </div>
        {isReplying && (
          <InlineCommentForm
            postId={postId}
            upperCommentId={comment._id}
            onSubmitted={() => {
              setIsReplying(false);
              onRefresh();
            }}
            onCancel={() => setIsReplying(false)}
          />
        )}
      </div>

      {childReplies.length > 0 && (
        <div className="mt-2 space-y-2">
          {childReplies.map((child) => (
            <CommentItem
              key={child._id}
              comment={child}
              replies={[]}
              allComments={allComments}
              postId={postId}
              onRefresh={onRefresh}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 댓글 섹션(목록 + 최상위 댓글 작성)
const CommentSection: React.FC<{ postId: string }> = ({ postId }) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [loading, setLoading] = useState(false);
  const { id } = useParams<{ id: string }>();

  const load = async () => {
    if (id) {
      try {
        setLoading(true);
        const res = await api.get(`/api/comment/${id}`);
        if (res.status === 200) {
          setComments(res.data as IComment[]);
        } else {
          setComments([]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (postId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const topLevel = comments.filter((c) => !c.upperCommentId);

  return (
    <div className="mt-8 rounded-xl border p-5 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-3 text-lg font-semibold dark:text-gray-100">댓글</h3>

      <InlineCommentForm postId={postId} onSubmitted={load} />

      <div className="mt-4">
        {loading && <div className="text-sm text-gray-500 dark:text-gray-400">로딩 중…</div>}
        {!loading && topLevel.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">첫 번째 댓글을 작성해 보세요.</div>
        )}
        {!loading &&
          topLevel.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              replies={[]}
              allComments={comments}
              postId={postId}
              onRefresh={load}
            />
          ))}
      </div>
    </div>
  );
};

export default CommentSection;