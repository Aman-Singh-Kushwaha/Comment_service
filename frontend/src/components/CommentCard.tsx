'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getReplies, deleteComment, updateComment } from '@/lib/api';
import { CommentForm } from './CommentForm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
  const router = useRouter();

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

  const handleReplyClick = () => {
    if (!user) {
      router.push('/login');
    } else {
      setIsReplying(!isReplying);
    }
  };

  return (
    <Card className="my-4 bg-neutral-100 border-none shadow-none">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="font-bold">{comment.author_username}</div>
          <div className="text-sm text-muted-foreground">
            {new Date(comment.comment_created_at).toLocaleDateString("en-US",{
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })} {"   "} {
              new Date(comment.comment_created_at).toLocaleTimeString("en-US", {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
            }
          </div>
          {comment.comment_is_edited && <div className="text-sm text-muted-foreground">(edited)</div>}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleUpdate}>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={3}
            />
            <div className="mt-2 space-x-2">
              <Button type="submit">Save</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <p>{comment.comment_content}</p>
        )}
      </CardContent>
      <CardFooter className="space-x-4">
        {parseInt(comment.childrenCount) > 0 && (
          <Button variant="ghost" onClick={handleShowReplies}>
            {showReplies ? 'Hide replies' : `Show ${comment.childrenCount} replies`}
          </Button>
        )}
        <Button variant="ghost" onClick={handleReplyClick}>Reply</Button>
        {user?.id === comment.author_id && (
          <>
            <Button variant="ghost" onClick={() => setIsEditing(true)}>Edit</Button>
            <Button variant="ghost" color="destructive" onClick={handleDelete}>Delete</Button>
          </>
        )}
      </CardFooter>

      {isReplying && (
        <div className="pl-4 border-l-2 ml-4">
          <CommentForm parentId={comment.comment_id} onCommentPosted={handleReplySuccess} />
        </div>
      )}

      {showReplies && (
        <div className="pl-4 border-l-2 ml-4">
          {replies.map(reply => (
            <CommentCard key={reply.comment_id} comment={reply} onCommentDeleted={handleShowReplies} />
          ))}
        </div>
      )}
    </Card>
  );
};
