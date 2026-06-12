# Blog Draft Workflow

This workflow keeps AI-generated writing reviewable. Drafts are never public until a user explicitly approves them.

## Daily Automation

- Run in a Codex worktree for `/Users/kjw_oon/Documents/GitHub/portfolio`.
- Use the Codex app cron schedule: every day at 09:00 KST.
- Choose a length preset before drafting. Default to `medium` unless the user asks otherwise.
  - `short`: 700-1,000 Korean characters excluding code blocks.
  - `medium`: 1,100-1,700 Korean characters excluding code blocks.
  - `long`: 1,800-2,700 Korean characters excluding code blocks.
- Start by running:

```sh
node scripts/blog-drafts/collect-github-activity.mjs --days=3 --limit=80 > /tmp/blog-activity.md
node scripts/blog-drafts/claude-draft-brief.mjs --activity-file=/tmp/blog-activity.md --length=medium > /tmp/claude-blog-brief.md
```

- Use Claude's brief as a first draft only. Codex remains responsible for final topic selection, safety filtering, editing, and file creation.
- If Claude CLI is unavailable or returns `NO_TOPIC`, continue with the Codex-only workflow and report the reason.
- Treat Claude's output as fallible. Verify repository names, paths, app names, package names, and technical claims against the activity report and local repo before saving a draft.
- If there is no strong topic, make no file changes and report `쓸 만한 글감 없음` with a short reason.
- If there is a strong topic, create exactly one draft MDX file under `apps/blog/content/drafts` and one cover asset under `apps/blog/public/blog/drafts`.
- Drafts may use SVG, PNG, JPG, or WebP assets from `apps/blog/public/blog/drafts`.
- Use SVG for deterministic diagrams, symbolic covers, and simple code/architecture visuals.
- Use generated bitmap images when the post benefits from a richer illustration or cover. Save generated project assets into `apps/blog/public/blog/drafts`; never reference an image that only exists under Codex's generated image cache.
- Run the content validator before reporting:

```sh
node scripts/blog-drafts/validate-blog-content.mjs
```

## Draft Format

Draft filenames should use a stable lowercase slug:

```txt
apps/blog/content/drafts/YYYY-MM-DD-short-topic.mdx
apps/blog/public/blog/drafts/YYYY-MM-DD-short-topic.svg
apps/blog/public/blog/drafts/YYYY-MM-DD-short-topic-figure.png
```

Use this frontmatter shape:

```mdx
---
title: 글 제목
description: 한 문장 요약
date: YYYY-MM-DD
cover: /blog/drafts/YYYY-MM-DD-short-topic.svg
tags: [Tag, Tag]
draftLength: medium
---
```

After frontmatter, include a review-only HTML comment. This comment must be removed before publishing.

```mdx
<!--
draft_review:
source_commits:
- owner/repo@abcdef0 https://github.com/owner/repo/commit/abcdef0
selection_reason: 왜 이 글감이 블로그에 적합한지
public_safety_notes: 공개 글에서 숨기거나 추상화한 내용
-->
```

## Writing Standard

- Write in natural Korean developer retrospective style.
- Use plain declarative Korean (`~다`) rather than honorific or polite endings (`~합니다`, `~습니다`).
- Prefer concrete decisions, tradeoffs, mistakes, constraints, and lessons learned.
- Do not list commits mechanically.
- Do not use filler openings like `이번 글에서는`, `알아보겠습니다`, `중요합니다`, `현대적인`, or broad generic claims.
- Avoid exaggerated AI tone, motivational conclusions, and tidy lessons that were not supported by the commits.
- Keep the scope narrow enough that the post feels like a real engineering note, not a survey article.
- Current published posts are short and focused, but new drafts should default to `medium` length unless the topic clearly works better as `short` or `long`.
- Do not paste Claude's output directly. Remove unsupported claims, tighten the language, and make the final draft sound like the existing blog.
- Frontmatter must match the existing blog parser, including `tags: [Tag, Tag]` as an inline array.
- Body images can be added with Markdown, for example `![Alt text](/blog/drafts/YYYY-MM-DD-short-topic-figure.png)`.
- Every body image needs meaningful alt text and must be referenced from `/blog/drafts/` while the post is still a draft.
- Cover images can be SVG, PNG, JPG, or WebP. Prefer generated PNG/WebP only when a richer illustration is actually useful.

## Private And Organization Repo Safety

- Treat private repos and organization repos as sensitive by default.
- Do not publish customer names, internal product names that are not already public, credentials, URLs, database/table names, ticket numbers, exact incident details, or proprietary workflows.
- Replace sensitive context with public-safe wording such as `관리자 도구`, `결제 연동`, `마이그레이션 작업`, or `운영 화면`.
- If a topic cannot be explained without sensitive detail, skip it.

## Approval And Publishing

The approval phrase is:

```txt
승인해서 발행 준비해줘
```

When that phrase is used:

- Confirm the selected draft path from the current context.
- Ensure the slug does not already exist in `apps/blog/content/posts`.
- Remove the review-only HTML comment.
- Remove draft-only frontmatter such as `draftLength`.
- Move the MDX file from `apps/blog/content/drafts` to `apps/blog/content/posts`.
- Move the cover from `apps/blog/public/blog/drafts` to `apps/blog/public/blog`, then update `cover` in frontmatter from `/blog/drafts/<filename>` to `/blog/<filename>`.
- Move any body images referenced from `/blog/drafts/<slug>...` to `apps/blog/public/blog`, then update their MDX references from `/blog/drafts/...` to `/blog/...`.
- Run:

```sh
node scripts/blog-drafts/validate-blog-content.mjs
pnpm --filter blog typecheck
pnpm --filter blog build
```

- Prepare a commit with the published post and cover only. Do not publish unrelated drafts.
