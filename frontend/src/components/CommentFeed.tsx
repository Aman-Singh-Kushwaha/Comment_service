'use client';

import { useEffect, useState, useCallback } from 'react';
import { getComments } from '@/lib/api';
import { Comment, CommentCard } from './CommentCard';
import { CommentForm } from './CommentForm';

export const CommentFeed = () => {
  const [comments, setComments] = useState<Comment[]>([]);

  const fetchComments = useCallback(async () => {
    const fetchedComments = await getComments();
    setComments(fetchedComments);
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Create a new comment</h2>
      <CommentForm onCommentPosted={fetchComments} />
      <hr className="my-6 border-gray-700" />
      <h2 className="text-xl font-semibold mb-4">Feed</h2>
      {comments.map(comment => (
        <CommentCard key={comment.comment_id} comment={comment} onCommentDeleted={fetchComments} />
      ))}
    </div>
  );
};
