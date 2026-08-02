import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Letterbox",
    short_name: "Letterbox",
    start_url: "/write",
    display: "standalone",
    background_color: "#030c14",
    theme_color: "#030c14",
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
