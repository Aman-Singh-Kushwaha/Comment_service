export interface LoginCredentials {
  username?: string;
  password?: string;
}

export interface RegisterData {
  username?: string;
  email?: string;
  password?: string;
}

export interface Notification {
  id: string;
  comment: {
    id: string;
    content: string;
  };
  sender: {
    username: string;
  };
  isRead: boolean;
  createdAt: string;
}
