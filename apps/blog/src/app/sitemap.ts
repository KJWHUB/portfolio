import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

const SITE = "https://blog.jungwoonkwon.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latestPostDate = posts[0]?.date ? new Date(posts[0].date) : new Date();

  return [
    { url: SITE, lastModified: latestPostDate, changeFrequency: "weekly", priority: 1 },
    ...posts.map((post) => ({
      url: `${SITE}/posts/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
