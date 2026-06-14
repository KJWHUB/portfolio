# jungwoonkwon.com

Monorepo for Kwon Jung Woon's portfolio and blog.

## Apps

- `apps/portfolio`: Portfolio site for `jungwoonkwon.com`
- `apps/blog`: Blog shell for `blog.jungwoonkwon.com`

## Development

```sh
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```

`pnpm dev` starts the portfolio at `http://localhost:1025` and the blog at
`http://localhost:1026`.

## Blog draft workflow

AI-generated blog drafts are kept out of the published MDX directory until they
are explicitly approved.

```sh
pnpm blog:activity
pnpm blog:claude-brief -- --activity-file=/tmp/blog-activity.md --length=medium
pnpm blog:validate-content
```

- Draft MDX files live in `apps/blog/content/drafts`.
- Draft cover assets live in `apps/blog/public/blog/drafts`.
- Published posts continue to live in `apps/blog/content/posts`.
- Full workflow and writing rules are in `docs/blog-draft-workflow.md`.
