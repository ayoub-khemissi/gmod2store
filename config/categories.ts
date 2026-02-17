export const productCategories = [
  {
    slug: "gamemodes",
    label: "Gamemodes",
    description: "Complete game modes for s&box servers",
  },
  { slug: "tools", label: "Tools", description: "Developer and admin tools" },
  {
    slug: "entities",
    label: "Entities",
    description: "Custom entities and NPCs",
  },
  {
    slug: "ui",
    label: "UI",
    description: "User interface components and HUDs",
  },
  { slug: "maps", label: "Maps", description: "Custom maps and environments" },
  {
    slug: "weapons",
    label: "Weapons",
    description: "Weapon packs and systems",
  },
] as const;

export type ProductCategorySlug = (typeof productCategories)[number]["slug"];
