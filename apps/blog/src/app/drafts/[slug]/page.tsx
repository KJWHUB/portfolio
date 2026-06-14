import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode, { type Options as RehypePrettyCodeOptions } from "rehype-pretty-code";
import { mdxComponents } from "@/components/mdx-components";
import { TableOfContents } from "@/components/table-of-contents";
import { getDraftBySlug, getDraftSlugs } from "@/lib/drafts";
import { getTableOfContents, rehypeHeadingIds } from "@/lib/toc";

const prettyCodeOptions: RehypePrettyCodeOptions = {
  theme: "github-dark",
  keepBackground: true,
};

export function generateStaticParams() {
  if (process.env.NODE_ENV === "production") return [];
  return getDraftSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  if (process.env.NODE_ENV === "production") return {};

  const { slug } = await params;
  const draft = getDraftBySlug(slug);
  if (!draft) return {};

  return {
    title: `[Draft] ${draft.title}`,
    description: draft.description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}.${month}.${day}`;
}

export default async function DraftPage({ params }: { params: Promise<{ slug: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();

  const { slug } = await params;
  const draft = getDraftBySlug(slug);
  if (!draft) notFound();

  const tableOfContents = getTableOfContents(draft.content);

  return (
    <main>
      <article>
        <div className="relative mb-8 aspect-[2/1] w-full overflow-hidden rounded-xl border">
          <Image
            src={draft.cover}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
          />
        </div>

        <div className="mb-4 inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          Draft preview
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{draft.title}</h1>
        <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span>{formatDate(draft.date)}</span>
          <span aria-hidden>·</span>
          <span>{draft.readingMinutes}분 읽기</span>
          {draft.draftLength ? (
            <>
              <span aria-hidden>·</span>
              <span>{draft.draftLength}</span>
            </>
          ) : null}
        </div>

        <TableOfContents items={tableOfContents} />

        <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
          <MDXRemote
            source={draft.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeHeadingIds, [rehypePrettyCode, prettyCodeOptions]],
              },
            }}
          />
        </div>
      </article>
    </main>
  );
}
