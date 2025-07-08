'use client';

import { useEffect, useState, useCallback } from 'react';
import { getComments } from '@/lib/api';
import { useAuth,  } from '@/contexts/AuthContext';
import { Comment, CommentCard } from './CommentCard';
import { CommentForm } from './CommentForm';

export const CommentFeed = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const {user} = useAuth();

  const fetchComments = useCallback(async () => {
    const fetchedComments = await getComments();
    setComments(fetchedComments);
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <div>
      <CommentForm onCommentPosted={fetchComments} />
      <hr className="my-6" />
      <h2 className="text-xl font-semibold mb-4">Feed</h2>
      {comments.map(comment => (

        // show other's non-deleted reply and user's deleted + non-deleted reply
        
        (!comment.comment_is_deleted || comment.author_id===user?.id) 
          && <CommentCard key={comment.comment_id} comment={comment} onCommentAction={fetchComments} />
      ))}
    </div>
  );
};
