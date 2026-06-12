#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "apps/blog");
const POSTS_DIR = path.join(BLOG_DIR, "content/posts");
const DRAFTS_DIR = path.join(BLOG_DIR, "content/drafts");
const PUBLIC_DIR = path.join(BLOG_DIR, "public");
const POSTS_LIB = path.join(BLOG_DIR, "src/lib/posts.ts");
const LENGTH_PRESETS = {
  short: { min: 700, max: 1000 },
  medium: { min: 1100, max: 1700 },
  long: { min: 1800, max: 2700 },
};

const errors = [];
const warnings = [];

function listMdxFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => path.join(dir, name));
}

function parseFrontmatter(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: source, error: "missing frontmatter block" };
  }

  const data = {};
  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf(":");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      data[key] = rawValue
        .slice(1, -1)
        .split(",")
        .map((value) => stripQuotes(value.trim()))
        .filter(Boolean);
    } else {
      data[key] = stripQuotes(rawValue);
    }
  }

  return { data, body: match[2], error: null };
}

function stripQuotes(value) {
  return value.replace(/^['"]|['"]$/g, "");
}

function relative(filePath) {
  return path.relative(ROOT, filePath);
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateMdx(filePath, type) {
  const slug = path.basename(filePath, ".mdx");
  const { data, body, error } = parseFrontmatter(filePath);
  const label = relative(filePath);

  if (error) errors.push(`${label}: ${error}`);

  for (const key of ["title", "description", "date", "cover", "tags"]) {
    if (data[key] === undefined || data[key] === "") {
      errors.push(`${label}: missing frontmatter field "${key}"`);
    }
  }

  if (typeof data.title === "string" && data.title.length > 80) {
    warnings.push(`${label}: title is long (${data.title.length} chars)`);
  }
  if (typeof data.description === "string" && data.description.length > 140) {
    warnings.push(`${label}: description is long (${data.description.length} chars)`);
  }
  if (typeof data.date === "string" && !isValidDate(data.date)) {
    errors.push(`${label}: date must be YYYY-MM-DD`);
  }
  if (!Array.isArray(data.tags) || data.tags.length === 0) {
    errors.push(`${label}: tags must be a non-empty inline array`);
  }
  if (typeof data.cover === "string") {
    validatePublicBlogAsset(label, data.cover, type, "cover");
  }

  const bodyWithoutComments = body.replace(/<!--[\s\S]*?-->/g, "").trim();
  if (bodyWithoutComments.length < 100) {
    warnings.push(`${label}: body looks short after removing review comments`);
  }

  validateBodyImages(label, bodyWithoutComments, type);

  if (type === "draft") {
    validateDraftLength(label, data, bodyWithoutComments);
  }

  return { slug, label };
}

function validatePublicBlogAsset(label, src, type, assetType) {
  if (!src.startsWith("/blog/")) {
    errors.push(`${label}: ${assetType} must start with /blog/`);
    return;
  }
  if (type === "draft" && !src.startsWith("/blog/drafts/")) {
    errors.push(`${label}: draft ${assetType} must stay under /blog/drafts/`);
  }
  if (type === "post" && src.startsWith("/blog/drafts/")) {
    errors.push(`${label}: published post cannot use a draft ${assetType} path`);
  }

  const assetPath = path.join(PUBLIC_DIR, src.replace(/^\//, ""));
  if (!fs.existsSync(assetPath)) {
    errors.push(`${label}: ${assetType} file does not exist at ${relative(assetPath)}`);
  }
}

function validateBodyImages(label, body, type) {
  const markdownImages = [...body.matchAll(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map(
    (match) => ({ alt: match[1], src: match[2] }),
  );
  const htmlImages = [...body.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g)].map((match) => ({
    alt: readAttribute(match[0], "alt"),
    src: match[1],
  }));
  const componentImages = [...body.matchAll(/<[A-Z][\w.]*\b[^>]*\bsrc=["']([^"']+)["'][^>]*\/?>/g)].map(
    (match) => ({
      alt: readAttribute(match[0], "alt"),
      src: match[1],
    }),
  );

  for (const image of [...markdownImages, ...htmlImages, ...componentImages]) {
    if (!image.src.startsWith("/blog/")) continue;
    validatePublicBlogAsset(label, image.src, type, "body image");
    if (image.alt.trim().length === 0) {
      warnings.push(`${label}: body image ${image.src} should include meaningful alt text`);
    }
  }
}

function readAttribute(source, name) {
  const match = source.match(new RegExp(`\\b${name}=["']([^"']*)["']`));
  return match ? match[1] : "";
}

function countKoreanDraftChars(body) {
  return body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[\s\n\r\t`#*()[\]{}.,;:!?'"\u201c\u201d\u2018\u2019|/\\<>+=_-]/g, "").length;
}

function validateDraftLength(label, data, body) {
  const draftLength = data.draftLength || "medium";
  const preset = LENGTH_PRESETS[draftLength];
  if (!preset) {
    warnings.push(`${label}: draftLength should be short, medium, or long`);
    return;
  }

  const count = countKoreanDraftChars(body);
  if (count < preset.min || count > preset.max) {
    warnings.push(
      `${label}: draftLength ${draftLength} targets ${preset.min}-${preset.max} chars excluding code blocks, current ${count}`,
    );
  }
}

function validatePostsLoader() {
  const source = fs.readFileSync(POSTS_LIB, "utf8");
  if (!source.includes('"content/posts"')) {
    errors.push(`${relative(POSTS_LIB)}: posts loader should read content/posts`);
  }
  if (source.includes("content/drafts")) {
    errors.push(`${relative(POSTS_LIB)}: posts loader must not read content/drafts`);
  }
}

const posts = listMdxFiles(POSTS_DIR).map((file) => validateMdx(file, "post"));
const drafts = listMdxFiles(DRAFTS_DIR).map((file) => validateMdx(file, "draft"));

const publishedSlugs = new Set(posts.map((post) => post.slug));
for (const draft of drafts) {
  if (publishedSlugs.has(draft.slug)) {
    errors.push(`${draft.label}: draft slug already exists in published posts`);
  }
}

validatePostsLoader();

for (const warning of warnings) console.warn(`Warning: ${warning}`);

if (errors.length > 0) {
  for (const error of errors) console.error(`Error: ${error}`);
  process.exit(1);
}

console.log(`Validated ${posts.length} published post(s) and ${drafts.length} draft(s).`);
