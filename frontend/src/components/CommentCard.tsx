'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getReplies, deleteComment, updateComment, restoreComment } from '@/lib/api';
import { CommentForm } from './CommentForm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Pencil } from 'lucide-react';

// Define the shape of a comment
export interface Comment {
  comment_id: string;
  comment_content: string;
  comment_parent_id: string | null;
  comment_is_edited: boolean;
  comment_is_deleted: boolean;
  comment_deleted_at: string | null;
  comment_created_at: string;
  comment_updated_at: string;
  author_id: string;
  author_username: string;
  childrenCount: string;
}

interface CommentCardProps {
  comment: Comment;
  onCommentAction: () => void;
}

export const CommentCard = ({ comment, onCommentAction }: CommentCardProps) => {
  const { user, token } = useAuth();
  const [replies, setReplies] = useState<Comment[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.comment_content);
  const [canRestore, setCanRestore] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (comment.comment_is_deleted && comment.comment_deleted_at) {
      const deletedAt = new Date(comment.comment_deleted_at).getTime();
      const now = new Date().getTime();
      const diff = now - deletedAt;
      setCanRestore(diff < 15 * 60 * 1000);
    }
  }, [comment.comment_is_deleted, comment.comment_deleted_at]);

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
      console.log("token: ", token);
      await deleteComment(comment.comment_id, token);
      onCommentAction();
    }
  };

  const handleRestore = async () => {
    if (!token) return;
    await restoreComment(comment.comment_id, token);
    onCommentAction();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    await updateComment(comment.comment_id, editedContent, token);
    setIsEditing(false);
    onCommentAction();
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
      <CardTitle className="p-2 pb-0">
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
        </div>
      </CardTitle>

      <CardContent>
        {comment.comment_is_deleted ? (
          <p className="text-muted-foreground italic">This comment has been deleted.</p>
        ) : isEditing ? (
          <form onSubmit={handleUpdate}>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={2}
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
      <CardFooter className="flex justify-between">
        <div className="space-x-4">
          {parseInt(comment.childrenCount) > 0 && !comment.comment_is_deleted && (
            <Button variant="ghost" onClick={handleShowReplies}>
              {showReplies ? 'Hide' : `Show ${comment.childrenCount} replies`}
            </Button>
          )}
          {!comment.comment_is_deleted && <Button variant="ghost" onClick={handleReplyClick}>Reply</Button>}
          {user?.id === comment.author_id && !comment.comment_is_deleted && (
            <>
              <Button variant="ghost" onClick={() => setIsEditing(true)}>Edit</Button>
              <Button variant="ghost" color="destructive" onClick={handleDelete}>Delete</Button>
            </>
          )}
          {user?.id === comment.author_id && comment.comment_is_deleted && canRestore && (
            <Button variant="ghost" onClick={handleRestore}>Restore</Button>
          )}
        </div>
        {comment.comment_is_edited && (
            <div className="flex items-center text-sm text-muted-foreground group">
            <Pencil className="w-4 h-4 mr-1" /> Edited 
            <span className="hidden group-hover:inline ml-1">at {new Date(comment.comment_updated_at).toLocaleTimeString("en-EN",{hour:"2-digit", minute: "2-digit"})}</span>
            </div>
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
            // show other's non-deleted reply and user's deleted + non-deleted reply
            (!reply.comment_is_deleted || reply.author_id===user?.id) &&
            <CommentCard key={reply.comment_id} comment={reply} onCommentAction={handleShowReplies} />
          ))}
        </div>
      )}
    </Card>
  );
};
