#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import process from "node:process";

const LENGTH_PRESETS = {
  short: {
    label: "short",
    range: "1,100-1,700 Korean characters excluding code blocks",
    guidance: "Use for one narrow decision or a compact engineering note. Keep examples focused.",
  },
  medium: {
    label: "medium",
    range: "1,800-2,700 Korean characters excluding code blocks",
    guidance: "Default. Use for one focused engineering note with enough context, examples, and 3-5 sections.",
  },
  long: {
    label: "long",
    range: "2,800-4,200 Korean characters excluding code blocks",
    guidance: "Use when the topic needs deeper context, tradeoffs, before/after examples, edge cases, and a fuller conclusion.",
  },
};

function parseArgs(argv) {
  const options = {
    activityFile: null,
    length: "medium",
    printPrompt: false,
  };

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--print-prompt") options.printPrompt = true;
    else if (arg.startsWith("--activity-file=")) options.activityFile = arg.slice("--activity-file=".length);
    else if (arg.startsWith("--length=")) options.length = arg.slice("--length=".length);
    else if (!options.activityFile) options.activityFile = arg;
  }

  if (!LENGTH_PRESETS[options.length]) {
    console.error(`Invalid --length value "${options.length}". Use short, medium, or long.`);
    process.exit(1);
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/blog-drafts/claude-draft-brief.mjs --activity-file=/tmp/blog-activity.md [--length=medium] [--print-prompt]

Ask Claude Code CLI for a first-pass blog draft brief from collected GitHub activity.
Claude is used only for text generation; it receives no tools and does not edit files.

Length presets:
- short: ${LENGTH_PRESETS.short.range}
- medium: ${LENGTH_PRESETS.medium.range}
- long: ${LENGTH_PRESETS.long.range}`);
}

function readActivity(filePath) {
  if (!filePath) return fs.readFileSync(0, "utf8");
  return fs.readFileSync(filePath, "utf8");
}

function kstDate() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    dateStyle: "short",
  }).format(new Date());
}

function buildPrompt(activity, lengthPreset) {
  return `You are helping draft a Korean developer blog post for Kwon Jung Woon.

Use the GitHub activity below as source material. Decide whether there is one strong, public-safe topic.

Hard rules:
- Write in Korean.
- Use plain declarative Korean endings such as "~다"; do not use honorific or polite endings such as "~합니다" or "~습니다".
- Prefer a natural developer retrospective, not a tutorial intro.
- Do not use filler such as "이번 글에서는", "알아보겠습니다", "중요합니다", "현대적인", or motivational closing lines.
- Do not mechanically list commits.
- Focus on decisions, constraints, tradeoffs, small mistakes, and lessons learned.
- Verify repository names, app names, package names, and paths against the activity. If a detail is uncertain, omit it.
- For private or organization repositories, remove customer names, internal identifiers, exact URLs, database/table names, ticket numbers, incident details, and proprietary workflow details.
- If a topic cannot be explained safely without private context, return "NO_TOPIC".
- Do not claim facts that are not supported by the activity.
- Do not write files or ask to run tools.

Today in KST: ${kstDate()}
Requested length: ${lengthPreset.label}
Length target: ${lengthPreset.range}
Length guidance: ${lengthPreset.guidance}

Return Markdown with exactly these sections:
## decision
Write either SELECTED or NO_TOPIC.

## selected_commits
List source commits as owner/repo@shortsha plus URL.

## public_safety_notes
Explain what was generalized or excluded.

## slug
Lowercase slug. Use YYYY-MM-DD-short-topic.

## frontmatter
Provide title, description, date, cover, tags. Use cover /blog/drafts/<slug>.png and tags as an inline array.

## draft
Write the actual MDX body. Follow the requested length target.

## self_review
Point out AI-like phrasing, unsafe detail, or unsupported claims that Codex should fix before saving.

GitHub activity:

${activity}`;
}

const options = parseArgs(process.argv.slice(2));
if (options.help) {
  printHelp();
  process.exit(0);
}

const activity = readActivity(options.activityFile);
const prompt = buildPrompt(activity, LENGTH_PRESETS[options.length]);

if (options.printPrompt) {
  process.stdout.write(`${prompt}\n`);
  process.exit(0);
}

try {
  const output = execFileSync(
    "claude",
    ["-p", prompt, "--tools", "", "--permission-mode", "dontAsk", "--output-format", "text"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  process.stdout.write(output);
} catch (error) {
  console.error("Claude draft brief failed. Continue with the Codex-only workflow if needed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
