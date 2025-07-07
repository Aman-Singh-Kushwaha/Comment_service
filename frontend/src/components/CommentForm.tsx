'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { postComment } from '@/lib/api';

interface CommentFormProps {
  parentId?: string | null;
  onCommentPosted: () => void;
}

export const CommentForm = ({ parentId = null, onCommentPosted }: CommentFormProps) => {
  const { token } = useAuth();
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('You must be logged in to comment.');
      return;
    }
    await postComment(content, parentId, token);
    setContent('');
    onCommentPosted();
  };

  return (
    <form onSubmit={handleSubmit} className="my-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 border rounded-lg bg-gray-800 text-white"
        placeholder="Add a comment..."
        rows={3}
      ></textarea>
      <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
        Post Comment
      </button>
    </form>
  );
};
