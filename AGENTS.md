# Repository Guidelines

- Blog posts are published from `apps/blog/content/posts`; draft posts stay in `apps/blog/content/drafts` and must not be treated as public content.
- For the daily blog draft workflow, follow `docs/blog-draft-workflow.md`. Use Claude Code CLI as a first-pass writing partner when available, but keep Codex responsible for final safety review and file edits.
- When the user says `승인해서 발행 준비해줘`, move only the approved draft into the published post path, remove review-only notes, move the cover out of `/blog/drafts`, then run the blog content validation, typecheck, and build commands documented in the workflow.
