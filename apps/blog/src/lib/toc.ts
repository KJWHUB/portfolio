export interface TableOfContentsItem {
  id: string;
  text: string;
  level: 2 | 3 | 4;
}

type RehypeNode = {
  type?: string;
  tagName?: string;
  value?: unknown;
  properties?: Record<string, unknown>;
  children?: RehypeNode[];
};

const headingLevels = new Set([2, 3, 4]);

function stripInlineMarkdown(value: string) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/<[^>]+>/g, "")
    .replace(/\\([\\`*_[\]{}()#+\-.!>])/g, "$1")
    .trim();
}

function slugifyHeading(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/["'`’“”]/g, "")
    .replace(/[^\p{Letter}\p{Number}\s._-]+/gu, "")
    .replace(/[\s._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createSlugger() {
  const seen = new Map<string, number>();

  return (value: string) => {
    const baseSlug = slugifyHeading(value) || "section";
    const count = seen.get(baseSlug) ?? 0;
    seen.set(baseSlug, count + 1);

    return count === 0 ? baseSlug : `${baseSlug}-${count}`;
  };
}

function getHeadingFromLine(line: string) {
  const match = line.match(/^\s{0,3}(#{1,6})(?:[ \t]+|$)(.*?)(?:[ \t]+#+)?[ \t]*$/);
  if (!match) return null;

  const level = match[1].length;
  if (!headingLevels.has(level)) return null;

  const text = stripInlineMarkdown(match[2]);
  if (!text) return null;

  return { level: level as TableOfContentsItem["level"], text };
}

export function getTableOfContents(content: string): TableOfContentsItem[] {
  const slug = createSlugger();
  const items: TableOfContentsItem[] = [];
  let fenceMarker: string | null = null;

  for (const line of content.split(/\r?\n/)) {
    const fenceMatch = line.match(/^\s{0,3}(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fenceMarker === marker) {
        fenceMarker = null;
      } else if (!fenceMarker) {
        fenceMarker = marker;
      }
      continue;
    }

    if (fenceMarker) continue;

    const heading = getHeadingFromLine(line);
    if (!heading) continue;

    items.push({
      id: slug(heading.text),
      text: heading.text,
      level: heading.level,
    });
  }

  return items;
}

function getNodeText(node: RehypeNode): string {
  if (typeof node.value === "string") return node.value;
  return node.children?.map(getNodeText).join("") ?? "";
}

function visitHeadings(node: RehypeNode, slug: (value: string) => string) {
  if (node.type === "element" && node.tagName) {
    const level = Number(node.tagName.slice(1));
    if (node.tagName.startsWith("h") && headingLevels.has(level)) {
      const text = getNodeText(node).trim();
      if (text) {
        node.properties = {
          ...node.properties,
          id: slug(text),
        };
      }
    }
  }

  node.children?.forEach((child) => visitHeadings(child, slug));
}

export function rehypeHeadingIds() {
  const slug = createSlugger();

  return (tree: RehypeNode) => {
    visitHeadings(tree, slug);
  };
}
