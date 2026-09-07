import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();

  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/auth/login`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${siteUrl}/auth/register`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
}
