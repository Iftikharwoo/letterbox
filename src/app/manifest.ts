import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Letterbox",
    short_name: "Letterbox",
    start_url: "/write",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#171717",
  };
}
