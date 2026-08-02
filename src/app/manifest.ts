import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Letterbox",
    short_name: "Letterbox",
    start_url: "/write",
    display: "standalone",
    background_color: "#0e0e0e",
    theme_color: "#0e0e0e",
    icons: [
      {
        src: "/assets/app-icon-1024.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/notification-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
