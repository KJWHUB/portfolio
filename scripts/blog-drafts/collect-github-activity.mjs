#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import process from "node:process";

const DEFAULT_DAYS = 3;
const DEFAULT_LIMIT = 80;
const AUTHOR = "KJWHUB";

function parseArgs(argv) {
  const options = {
    days: DEFAULT_DAYS,
    limit: DEFAULT_LIMIT,
    format: "markdown",
  };

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    const [key, value] = arg.split("=");
    if (key === "--days") options.days = Number(value);
    if (key === "--limit") options.limit = Number(value);
    if (key === "--format") options.format = value;
  }

  if (!Number.isFinite(options.days) || options.days < 1) options.days = DEFAULT_DAYS;
  if (!Number.isFinite(options.limit) || options.limit < 1) options.limit = DEFAULT_LIMIT;

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/blog-drafts/collect-github-activity.mjs [--days=3] [--limit=80] [--format=markdown|json]

Collect recent GitHub commits authored by ${AUTHOR} and rank them as blog draft candidates.
The command requires an authenticated gh CLI session with access to the target repositories.`);
}

function runGhSearch(limit) {
  const stdout = execFileSync(
    "gh",
    [
      "search",
      "commits",
      "--author",
      AUTHOR,
      "--sort",
      "committer-date",
      "--order",
      "desc",
      "--limit",
      String(limit),
      "--json",
      "repository,sha,commit,url",
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );

  return JSON.parse(stdout);
}

function commitDate(item) {
  const value = item.commit?.committer?.date || item.commit?.author?.date;
  return value ? new Date(value) : null;
}

function firstLine(message) {
  return String(message || "").split(/\r?\n/)[0].trim();
}

function bodyExcerpt(message) {
  return String(message || "")
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^co-authored-by:/i.test(line))
    .filter((line) => !/^[-\s]*$/.test(line))
    .slice(0, 6);
}

function lowSignalReasons(item) {
  const repo = item.repository?.fullName || "";
  const title = firstLine(item.commit?.message);
  const lowerTitle = title.toLowerCase();
  const reasons = [];

  if (/\/leetcode$/i.test(repo) || /leethub/i.test(item.commit?.message || "")) {
    reasons.push("LeetHub/algorithm auto log");
  }
  if (/^(create|attach)\s+(readme|notes)\b/i.test(title)) {
    reasons.push("generated README/notes");
  }
  if (/^time:\s*\d+/i.test(title)) {
    reasons.push("benchmark-only commit");
  }
  if (/^update readme(\.md)?$/i.test(lowerTitle) || /^docs?:\s*(typo|readme)/i.test(lowerTitle)) {
    reasons.push("README-only or typo-level change");
  }
  if (/^(style|chore)(\([^)]+\))?:\s*(format|prettier|lint|typo)/i.test(lowerTitle)) {
    reasons.push("formatting-only change");
  }

  return reasons;
}

function scoreCandidate(item) {
  const title = firstLine(item.commit?.message);
  const body = bodyExcerpt(item.commit?.message);
  const text = `${title}\n${body.join("\n")}`.toLowerCase();
  const reasons = lowSignalReasons(item);
  let score = 0;

  if (/^(feat|fix|refactor|perf|build|chore|docs)(\([^)]+\))?:/i.test(title)) score += 1;
  if (/(migration|migrate|upgrade|refactor|architecture|workflow|pipeline|monorepo|admin|auth|payment|api|database|cache|view count|tailwind|next|react|vue|mdx|rss|sitemap|automation)/i.test(text)) {
    score += 2;
  }
  if (body.length >= 3) score += 1;
  if (item.repository?.isPrivate || item.repository?.owner?.type === "Organization") score += 1;
  if (reasons.length > 0) score -= 4;

  return score;
}

function candidateNotes(item) {
  const notes = [];
  if (item.repository?.isPrivate) notes.push("private repo: publish only abstracted context");
  if (item.repository?.owner?.type === "Organization") notes.push("organization repo: remove internal/customer detail");
  return notes;
}

function formatKst(date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function toCandidate(item) {
  const date = commitDate(item);
  return {
    repo: item.repository?.fullName || "unknown",
    private: Boolean(item.repository?.isPrivate),
    ownerType: item.repository?.owner?.type || "unknown",
    sha: item.sha,
    shortSha: String(item.sha || "").slice(0, 7),
    url: item.url,
    title: firstLine(item.commit?.message),
    body: bodyExcerpt(item.commit?.message),
    date: date?.toISOString(),
    dateKst: date ? formatKst(date) : "unknown",
    score: scoreCandidate(item),
    lowSignalReasons: lowSignalReasons(item),
    notes: candidateNotes(item),
  };
}

function renderMarkdown(candidates, ignored, options) {
  const lines = [
    "# Recent GitHub Activity",
    "",
    `Window: last ${options.days} day(s)`,
    `Author: ${AUTHOR}`,
    `Generated: ${formatKst(new Date())} KST`,
    "",
  ];

  if (candidates.length === 0) {
    lines.push("쓸 만한 글감 없음: recent commits were too small, generated, or unsafe to publish.");
  } else {
    lines.push("## Strong Candidates", "");
    for (const candidate of candidates) {
      lines.push(
        `- ${candidate.repo}@${candidate.shortSha} (${candidate.dateKst}, score ${candidate.score})`,
        `  - ${candidate.title}`,
        `  - ${candidate.url}`,
      );
      if (candidate.notes.length > 0) {
        lines.push(`  - Safety: ${candidate.notes.join("; ")}`);
      }
      if (!candidate.private && candidate.ownerType !== "Organization" && candidate.body.length > 0) {
        lines.push("  - Context:");
        for (const line of candidate.body) lines.push(`    - ${line}`);
      }
    }
  }

  lines.push("", "## Ignored Or Low Confidence", "");
  if (ignored.length === 0) {
    lines.push("- None");
  } else {
    for (const candidate of ignored.slice(0, 12)) {
      const reason =
        candidate.lowSignalReasons.length > 0
          ? candidate.lowSignalReasons.join("; ")
          : candidate.score >= 2
            ? "not selected in top candidates"
            : `low score ${candidate.score}`;
      lines.push(`- ${candidate.repo}@${candidate.shortSha}: ${candidate.title} (${reason})`);
    }
  }

  return `${lines.join("\n")}\n`;
}

const options = parseArgs(process.argv.slice(2));
if (options.help) {
  printHelp();
  process.exit(0);
}

let commits;
try {
  commits = runGhSearch(options.limit);
} catch (error) {
  console.error("Failed to collect GitHub commits with gh.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const since = Date.now() - options.days * 24 * 60 * 60 * 1000;
const recent = commits
  .filter((item) => {
    const date = commitDate(item);
    return date && date.getTime() >= since;
  })
  .map(toCandidate)
  .sort((a, b) => b.score - a.score || String(b.date).localeCompare(String(a.date)));

const candidates = recent.filter((item) => item.score >= 2 && item.lowSignalReasons.length === 0).slice(0, 8);
const ignored = recent.filter((item) => !candidates.includes(item));

if (options.format === "json") {
  console.log(JSON.stringify({ options, candidates, ignored }, null, 2));
} else {
  process.stdout.write(renderMarkdown(candidates, ignored, options));
}
