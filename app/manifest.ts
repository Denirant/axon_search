import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AxonAI - AI-powered Search Engine",
    short_name: "AxonAI",
    description: "A minimalistic AI-powered search engine",
    start_url: "/",
    display: "standalone",
    categories: ["search", "ai", "productivity"],
    background_color: "#171717",
    icons: [
      {
        src: "/favicon.png",
        sizes: "192x192",
        type: "image/png"
      },
    ],
  }
}