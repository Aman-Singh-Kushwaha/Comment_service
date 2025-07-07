'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { postComment } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentFormProps {
  parentId?: string | null;
  onCommentPosted: () => void;
}

export const CommentForm = ({ parentId = null, onCommentPosted }: CommentFormProps) => {
  const { user, token } = useAuth();
  const [content, setContent] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      router.push('/login');
      return;
    }
    await postComment(content, parentId, token);
    setContent('');
    onCommentPosted();
  };

  return (
    <form onSubmit={handleSubmit} className="my-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Post a comment..."
        rows={3}
      />
      <Button type="submit" className="mt-2">
        Post Comment
      </Button>
    </form>
  );
};
