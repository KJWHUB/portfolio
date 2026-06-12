import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

const SITE = "https://blog.jungwoonkwon.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  return [
    { url: SITE, lastModified: new Date() },
    ...posts.map((post) => ({
      url: `${SITE}/posts/${post.slug}`,
      lastModified: new Date(post.date),
    })),
  ];
}
