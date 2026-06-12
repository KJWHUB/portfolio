import { Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { getAllViews } from "@/lib/views";

export const revalidate = 60;

function formatDate(value: string) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}.${month}.${day}`;
}

export default async function BlogHome() {
  const posts = getAllPosts();
  const views = await getAllViews();

  return (
    <main>
      <header className="mb-10 space-y-1">
        <h1 className="text-sm font-medium">Writing</h1>
        <p className="text-muted-foreground text-sm">권중운의 개발 노트 · 글 {posts.length}편</p>
      </header>

      <ul className="border-y">
        {posts.map((post, index) => (
          <li key={post.slug} className={index > 0 ? "border-t" : undefined}>
            <Link
              href={`/posts/${post.slug}`}
              className="group -mx-3 flex gap-4 rounded-xl px-3 py-4 transition-colors duration-200 hover:bg-muted/60"
            >
              <div className="relative h-[70px] w-[104px] flex-none overflow-hidden rounded-md border">
                <Image
                  src={post.cover}
                  alt=""
                  fill
                  sizes="104px"
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-medium leading-snug">
                  <span className="link-underline">{post.title}</span>
                </h2>
                <p className="text-muted-foreground mt-1 truncate text-[13px] leading-relaxed">
                  {post.description}
                </p>
                <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
                  <span>{formatDate(post.date)}</span>
                  <span aria-hidden>·</span>
                  <span>{post.readingMinutes}분 읽기</span>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="size-3.5" aria-hidden />
                    {(views[post.slug] ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
