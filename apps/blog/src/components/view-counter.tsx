"use client";

import { Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ViewCounter({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    fetch(`/api/views/${slug}`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => setCount(typeof data.count === "number" ? data.count : 0))
      .catch(() => setCount(0));
  }, [slug]);

  return (
    <span className="inline-flex items-center gap-1.5">
      <Eye className="size-4" aria-hidden />
      <span>{count === null ? "—" : count.toLocaleString()}</span>
    </span>
  );
}
