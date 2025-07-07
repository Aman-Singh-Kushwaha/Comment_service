import { CommentFeed } from "@/components/CommentFeed";

export default function Home() {
  return (
    <main className=" mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Comments</h1>
      <CommentFeed />
    </main>
  );
}
