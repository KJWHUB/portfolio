import { Children, type ReactNode } from "react";
import { AlertTriangle, ExternalLink, GitBranch, Lightbulb, Scale } from "lucide-react";
import { cn } from "@repo/ui/utils";

type CalloutTone = "note" | "decision" | "tradeoff" | "warning";

const calloutConfig = {
  note: {
    icon: Lightbulb,
    className:
      "border-zinc-200 bg-zinc-50 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900/45 dark:text-zinc-50",
  },
  decision: {
    icon: GitBranch,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-50",
  },
  tradeoff: {
    icon: Scale,
    className:
      "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-50",
  },
  warning: {
    icon: AlertTriangle,
    className:
      "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-50",
  },
} satisfies Record<CalloutTone, { icon: typeof Lightbulb; className: string }>;

export function Callout({
  title,
  tone = "note",
  children,
  className,
}: {
  title?: string;
  tone?: CalloutTone;
  children: ReactNode;
  className?: string;
}) {
  const config = calloutConfig[tone];
  const Icon = config.icon;

  return (
    <aside className={cn("not-prose my-7 rounded-lg border p-4", config.className, className)}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-4 flex-none" aria-hidden />
        <div className="min-w-0">
          {title ? <p className="m-0 text-sm font-semibold leading-6">{title}</p> : null}
          <div className="prose prose-neutral dark:prose-invert prose-p:my-1.5 prose-code:text-[0.9em] mt-1 max-w-none text-sm leading-7">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function Compare({
  leftTitle = "Before",
  rightTitle = "After",
  children,
  className,
}: {
  leftTitle?: string;
  rightTitle?: string;
  children: ReactNode;
  className?: string;
}) {
  const items = Children.toArray(children).filter(
    (child) => !(typeof child === "string" && child.trim().length === 0),
  );
  const columns = [
    { title: leftTitle, content: items[0] },
    { title: rightTitle, content: items[1] },
  ];

  return (
    <div className={cn("mdx-compare not-prose my-8 grid gap-3 sm:grid-cols-2", className)}>
      {columns.map((column) => (
        <section key={column.title} className="bg-background min-w-0 rounded-lg border p-4">
          <h3 className="m-0 text-sm font-semibold leading-6">{column.title}</h3>
          <div className="prose prose-neutral dark:prose-invert prose-p:my-2 prose-pre:my-3 mt-3 max-w-none text-sm leading-7">
            {column.content}
          </div>
        </section>
      ))}
    </div>
  );
}

export function Flow({
  title,
  items,
  className,
}: {
  title?: string;
  items?: string[] | string;
  className?: string;
}) {
  const normalizedItems = Array.isArray(items)
    ? items
    : typeof items === "string"
      ? items
          .split("|")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  if (normalizedItems.length === 0) return null;

  return (
    <figure className={cn("not-prose bg-muted/20 my-8 rounded-lg border p-4 sm:p-5", className)}>
      {title ? (
        <figcaption className="mb-4 text-sm font-semibold leading-6">{title}</figcaption>
      ) : null}
      <ol className="before:bg-border relative space-y-3 before:absolute before:bottom-4 before:left-4 before:top-4 before:w-px">
        {normalizedItems.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="relative grid grid-cols-[2rem_1fr] items-center gap-3"
          >
            <span className="ring-background z-10 inline-flex size-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white shadow-sm ring-4 dark:bg-emerald-500 dark:text-emerald-950">
              {index + 1}
            </span>
            <span className="bg-background min-w-0 rounded-md border px-3 py-3 text-sm leading-6 shadow-sm">
              {item}
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

export function Figure({
  src,
  alt,
  caption,
  className,
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("not-prose my-8", className)}>
      <img src={src} alt={alt} loading="lazy" className="bg-muted w-full rounded-lg border" />
      {caption ? (
        <figcaption className="text-muted-foreground mt-2 text-center text-sm leading-6">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function TechStack({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("not-prose bg-muted/20 my-8 rounded-lg border p-4", className)}>
      {title ? <h3 className="m-0 mb-3 text-base font-semibold leading-7">{title}</h3> : null}
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function Tech({
  name,
  description,
  src,
  alt,
  href,
  className,
}: {
  name: string;
  description?: string;
  src?: string;
  alt?: string;
  href?: string;
  className?: string;
}) {
  const content = (
    <div className="flex min-w-0 items-start gap-3">
      {src ? (
        <img
          src={src}
          alt={alt ?? `${name} logo`}
          loading="lazy"
          className="mt-0.5 size-7 flex-none object-contain"
        />
      ) : (
        <span className="bg-background text-muted-foreground ring-border mt-0.5 inline-flex size-7 flex-none items-center justify-center rounded-md text-[11px] font-semibold ring-1">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
      <div className="min-w-0">
        <p className="m-0 flex items-center gap-1.5 text-sm font-semibold leading-5">
          <span>{name}</span>
          {href ? (
            <ExternalLink className="text-muted-foreground size-3.5 flex-none" aria-hidden />
          ) : null}
        </p>
        {description ? (
          <p className="text-foreground/75 m-0 mt-1 text-[13px] leading-5">{description}</p>
        ) : null}
      </div>
    </div>
  );

  const classNames = cn(
    "min-w-0 rounded-md border bg-background p-3 transition-colors",
    href && "hover:bg-muted/60",
    className,
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classNames}>
        {content}
      </a>
    );
  }

  return <div className={classNames}>{content}</div>;
}

export const mdxComponents = {
  Callout,
  Compare,
  Figure,
  Flow,
  Tech,
  TechStack,
};
