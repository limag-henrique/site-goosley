import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Criminalidade facial · Goosley Digital",
    short_name: "Criminalidade facial",
    description: "Demonstração acadêmica fictícia de similaridade facial.",
    start_url: "/criminalidadefacial",
    scope: "/criminalidadefacial",
    display: "fullscreen",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/images/logo%20com%20fundo.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
