import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { PostFrontmatter, Post, PostMeta } from "@/lib/posts";

const DRAFTS_DIR = path.join(process.cwd(), "content/drafts");

function removeHtmlComments(content: string) {
  return content.replace(/<!--[\s\S]*?-->\s*/g, "");
}

export interface DraftFrontmatter extends PostFrontmatter {
  draftLength?: "short" | "medium" | "long";
}

export interface DraftMeta extends PostMeta {
  draftLength?: DraftFrontmatter["draftLength"];
}

export interface Draft extends Post {
  draftLength?: DraftFrontmatter["draftLength"];
}

function readDraft(slug: string): Draft | null {
  const fullPath = path.join(DRAFTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;

  const file = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(file);
  const frontmatter = data as DraftFrontmatter;

  return {
    ...frontmatter,
    slug,
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
    content: removeHtmlComments(content),
  };
}

export function getDraftSlugs(): string[] {
  if (!fs.existsSync(DRAFTS_DIR)) return [];
  return fs
    .readdirSync(DRAFTS_DIR)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => name.replace(/\.mdx$/, ""));
}

export function getDraftBySlug(slug: string): Draft | null {
  return readDraft(slug);
}

export function getAllDrafts(): DraftMeta[] {
  return getDraftSlugs()
    .map(readDraft)
    .filter((draft): draft is Draft => draft !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(({ content: _content, ...meta }) => meta);
}
