import { CommentFeed } from '@/components/CommentFeed';

export default function Home() {
  return (
    <main className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Comments</h1>
      <CommentFeed />
    </main>
  );
}
