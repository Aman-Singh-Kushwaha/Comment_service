'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getReplies, deleteComment, updateComment } from '@/lib/api';
import { CommentForm } from './CommentForm';

// Define the shape of a comment
export interface Comment {
  comment_id: string;
  comment_content: string;
  comment_parent_id: string | null;
  comment_is_edited: boolean;
  comment_created_at: string;
  author_id: string;
  author_username: string;
  childrenCount: string;
}

interface CommentCardProps {
  comment: Comment;
  onCommentDeleted: () => void;
}

export const CommentCard = ({ comment, onCommentDeleted }: CommentCardProps) => {
  const { user, token } = useAuth();
  const [replies, setReplies] = useState<Comment[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.comment_content);

  const handleShowReplies = async () => {
    if (!showReplies) {
      const fetchedReplies = await getReplies(comment.comment_id);
      setReplies(fetchedReplies);
    }
    setShowReplies(!showReplies);
  };

  const handleReplySuccess = () => {
    setIsReplying(false);
    handleShowReplies(); // Refresh replies
  };

  const handleDelete = async () => {
    if (!token) return;
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(comment.comment_id, token);
      onCommentDeleted();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    await updateComment(comment.comment_id, editedContent, token);
    setIsEditing(false);
    // Optimistically update the UI
    comment.comment_content = editedContent;
    comment.comment_is_edited = true;
  };

  return (
    <div className="p-4 my-2 border rounded-lg bg-gray-900">
      <div className="flex items-center mb-2">
        <div className="font-bold">{comment.author_username}</div>
        <div className="ml-2 text-sm text-gray-400">
          {new Date(comment.comment_created_at).toLocaleString()}
        </div>
        {comment.comment_is_edited && <div className="ml-2 text-sm text-gray-500">(edited)</div>}
      </div>

      {isEditing ? (
        <form onSubmit={handleUpdate}>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-2 border rounded-lg bg-gray-800 text-white"
            rows={3}
          ></textarea>
          <div className="mt-2">
            <button type="submit" className="px-2 py-1 bg-blue-500 text-white rounded-lg">Save</button>
            <button onClick={() => setIsEditing(false)} className="ml-2 px-2 py-1 bg-gray-600 text-white rounded-lg">Cancel</button>
          </div>
        </form>
      ) : (
        <p className="text-gray-300">{comment.comment_content}</p>
      )}

      <div className="mt-2 flex items-center space-x-4">
        {parseInt(comment.childrenCount) > 0 && (
          <button onClick={handleShowReplies} className="text-sm text-blue-400">
            {showReplies ? 'Hide' : `Show ${comment.childrenCount} replies`}
          </button>
        )}
        <button onClick={() => setIsReplying(!isReplying)} className="text-sm text-gray-400">Reply</button>
        {user?.id === comment.author_id && (
          <>
            <button onClick={() => setIsEditing(true)} className="text-sm text-gray-400">Edit</button>
            <button onClick={handleDelete} className="text-sm text-red-500">Delete</button>
          </>
        )}
      </div>

      {isReplying && (
        <CommentForm parentId={comment.comment_id} onCommentPosted={handleReplySuccess} />
      )}

      {showReplies && (
        <div className="pl-4 border-l-2 border-gray-700 mt-2">
          {replies.map(reply => (
            <CommentCard key={reply.comment_id} comment={reply} onCommentDeleted={handleShowReplies} />
          ))}
        </div>
      )}
    </div>
  );
};
