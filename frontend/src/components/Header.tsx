'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="p-4 flex justify-between items-center border-b">
      <Link href="/" className="text-lg font-bold">Comments Service</Link>
      <div>
        {user ? (
          <Button onClick={logout}>Logout</Button>
        ) : (
          <div className="space-x-2">
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};