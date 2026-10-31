/** Editorial guidance, not a publication limit. Keep older, concise drafts valid. */
export const DRAFT_LENGTH_PRESETS = {
  short: { min: 1100, max: 2500 },
  medium: { min: 1800, max: 6500 },
  long: { min: 2800, max: 12000 },
} as const;

// A display estimate, not a measured reading speed. Hangul syllables are not words.
export const READING_WORDS_PER_MINUTE = 200;
const wordSegmenter = new Intl.Segmenter("ko", { granularity: "word" });
const visibleProps = new Set([
  "title", "leftTitle", "rightTitle", "items", "caption", "name", "description",
]);

export function removeReviewComments(source: string): string {
  return source.replace(/<!--[\s\S]*?-->\s*/g, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
}

/** Plain text approximation of our static MDX, excluding source-only metadata. */
export function getReadableText(source: string, includeCode = true): string {
  let text = removeReviewComments(source.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, ""));
  const code: string[] = [];
  const preserveCode = (value: string) => {
    const index = code.push(includeCode ? value : "") - 1;
    return `\uE000${index}\uE001`;
  };
  text = text
    .replace(/^(`{3,}|~{3,})[^\n]*\n([\s\S]*?)^\1[ \t]*$/gm, (_match, _fence, body: string) => preserveCode(body))
    .replace(/`([^`\n]+)`/g, (_match, value: string) => preserveCode(value))
    .replace(/^\s*(?:import|export)\s+[^\n]*;?\s*$/gm, "")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?[A-Za-z][\w.-]*(?:\s+(?:[^"'<>]|"[^"]*"|'[^']*')*)?\s*\/?>/g, (tag) => {
      const labels = Array.from(tag.matchAll(/\b(\w+)\s*=\s*(["'])([\s\S]*?)\2/g))
        .filter(([, name]) => visibleProps.has(name))
        .map(([, , , value]) => value.replaceAll("|", " "));
      return ` ${labels.join(" ")} `;
    })
    .replace(/^\s*\[[^\]]+\]:\s+.*$/gm, "")
    .replace(/!\[[^\]]*\](?:\([^)]*\)|\[[^\]]*\])/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1")
    .replace(/https?:\/\/[^\s<>]+/g, "")
    .replace(/&(?:amp|lt|gt|quot|apos|nbsp);/g, (entity) => ({
      "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'", "&nbsp;": " ",
    })[entity] ?? entity)
    .replace(/\uE000(\d+)\uE001/g, (_match, index: string) => code[Number(index)])
    .replace(/\s+/g, " ")
    .trim();
  return text;
}

/** Count visible letters/numbers; leave fenced and inline code out of length guidance. */
export function countDraftCharacters(source: string): number {
  return (getReadableText(source, false).match(/[\p{L}\p{N}]/gu) ?? []).length;
}

export function getReadingStats(source: string) {
  const words = Array.from(wordSegmenter.segment(getReadableText(source)))
    .filter((segment) => segment.isWordLike).length;
  const minutes = words / READING_WORDS_PER_MINUTE;
  return { words, minutes, readingMinutes: Math.max(1, Math.round(minutes)) };
}

export function getReadingMinutes(source: string): number {
  return getReadingStats(source).readingMinutes;
}
