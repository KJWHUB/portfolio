import assert from "node:assert/strict";
import test from "node:test";
import {
  DRAFT_LENGTH_PRESETS,
  countDraftCharacters,
  getReadableText,
  getReadingStats,
} from "../../apps/blog/src/lib/content-metrics.ts";

test("Korean words are segmented as words, not individual Hangul syllables", () => {
  const text = "담당자가 진행 상태를 확인했다. ".repeat(100);
  assert.equal(getReadingStats(text).words, 400);
  assert.equal(getReadingStats(text).readingMinutes, 2);
});

test("frontmatter and review comments do not change public reading time or length", () => {
  const body = "QA 이슈를 티켓으로 관리했다. ".repeat(100);
  const draft = `---\ntitle: hidden metadata\ndate: 2026-09-02\n---\n<!-- ${"review only ".repeat(1000)} -->\n{/* hidden comment */}\n${body}`;
  assert.deepEqual(getReadingStats(draft), getReadingStats(body));
  assert.equal(countDraftCharacters(draft), countDraftCharacters(body));
});

test("English remains word based and additional visible prose increases the estimate", () => {
  assert.equal(getReadingStats("task ".repeat(400)).readingMinutes, 2);
  assert.equal(getReadingStats("task ".repeat(800)).readingMinutes, 4);
  assert.equal(getReadingStats("").readingMinutes, 1);
});

test("mixed Korean and Latin product names are retained", () => {
  assert.deepEqual(
    [...new Intl.Segmenter("ko", { granularity: "word" }).segment(getReadableText("Google Slides에서 Linear로 이슈를 옮겼다."))]
      .filter((item) => item.isWordLike).map((item) => item.segment),
    ["Google", "Slides", "에서", "Linear", "로", "이슈를", "옮겼다"],
  );
});

test("link targets and image source paths do not inflate the reading estimate", () => {
  const source = `[설명](https://example.com/${"long-path/".repeat(200)})\n![커버](https://example.com/image.png)\n[참고][ref]\n[ref]: https://example.com/private-source`;
  assert.equal(getReadableText(source), "설명 참고");
});

test("MDX reader-facing labels count, while component source attributes do not", () => {
  const source = '<Flow title="진행 순서" items="작성|확인" /><Figure src="/blog/drafts/long-file-name.png" alt="대체 설명" caption="비교 결과" /><Callout tone="decision" title="선택 기준">담당자와 상태</Callout>';
  assert.equal(getReadableText(source), "진행 순서 작성 확인 비교 결과 선택 기준 담당자와 상태");
});

test("code contributes to reading time but not prose length, including generic types", () => {
  const source = '본문\n\n```ts\nconst result: Array<Task> = tasks;\n```\n\n`ticket.id`';
  assert.equal(countDraftCharacters(source), 2);
  assert.ok(getReadableText(source).includes("Array<Task>"));
  assert.ok(getReadingStats(source).words > getReadingStats("본문").words);
});

test("length ranges allow expanded drafts without invalidating the previous medium range", () => {
  assert.ok(DRAFT_LENGTH_PRESETS.medium.min <= 1800);
  assert.equal(DRAFT_LENGTH_PRESETS.medium.max, 6500);
  assert.equal(DRAFT_LENGTH_PRESETS.long.max, 12000);
  assert.equal(countDraftCharacters("담당자 · 상태\n\n| 기준 | 내용 |\n| --- | --- |\n| 무료 | 확인 |"), 13);
});
