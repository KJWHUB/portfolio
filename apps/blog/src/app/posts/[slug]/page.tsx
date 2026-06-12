import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode, { type Options as RehypePrettyCodeOptions } from "rehype-pretty-code";
import { ArrowLeft } from "lucide-react";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import { mdxComponents } from "@/components/mdx-components";
import { ViewCounter } from "@/components/view-counter";

const SITE_NAME = "Kwon Jung Woon Blog";

const prettyCodeOptions: RehypePrettyCodeOptions = {
  theme: "github-dark",
  keepBackground: true,
};

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: {
      canonical: `/posts/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/posts/${post.slug}`,
      siteName: SITE_NAME,
      type: "article",
      locale: "ko_KR",
      publishedTime: new Date(post.date).toISOString(),
      authors: ["Kwon Jung Woon"],
      tags: post.tags,
      images: [{ url: post.cover, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.cover],
    },
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}.${month}.${day}`;
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main>
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Writing
      </Link>

      <article>
        <div className="relative mb-8 aspect-[2/1] w-full overflow-hidden rounded-xl border">
          <Image
            src={post.cover}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
          />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        <div className="text-muted-foreground mt-3 flex items-center gap-2 text-sm">
          <span>{formatDate(post.date)}</span>
          <span aria-hidden>·</span>
          <span>{post.readingMinutes}분 읽기</span>
          <span aria-hidden>·</span>
          <ViewCounter slug={slug} />
        </div>

        <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
              },
            }}
          />
        </div>
      </article>
    </main>
  );
}
