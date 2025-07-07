'use client';

import { createContext, useContext, ReactNode } from 'react';

// Define the shape of the user and auth context
interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for development
const mockUser: User = {
  id: '49774fed-2090-46f3-93a8-b04d6cd6bc3a', // This ID should correspond to a user in your DB
  username: 'verify_user_456',
};

const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InZlcmlmeV91c2VyXzQ1NiIsInN1YiI6IjQ5Nzc0ZmVkLTIwOTAtNDZmMy05M2E4LWIwNGQ2Y2Q2YmMzYSIsImlhdCI6MTc1MjAxMDUwOSwiZXhwIjoxNzUyMDE0MTA5fQ.vXRGqZvhGlfqgMRG-lnRgt2jBYQvvNy1wq6fzyUvM4M';

// Create a provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const value = {
    user: mockUser,
    token: mockToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
