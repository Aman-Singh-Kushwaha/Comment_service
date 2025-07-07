const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// A helper to handle responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  if (response.status === 204) { // No Content
    return;
  }
  return response.json();
};

// Get top-level comments
export const getComments = async () => {
  const response = await fetch(`${API_BASE_URL}/comments`);
  return handleResponse(response);
};

// Get replies for a comment
export const getReplies = async (commentId: string) => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}/replies`);
  return handleResponse(response);
};

// Post a new comment or a reply
export const postComment = async (content: string, parentId: string | null, token: string) => {
  const response = await fetch(`${API_BASE_URL}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content, parentId }),
  });
  return handleResponse(response);
};

// Update a comment
export const updateComment = async (commentId: string, content: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  return handleResponse(response);
};

// Delete a comment
export const deleteComment = async (commentId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};
