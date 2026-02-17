export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "s&box Store",
  description:
    "The marketplace for s&box creators and players. Discover gamemodes, tools, maps, and assets for Source 2.",
  navItems: [
    { label: "Home", href: "/" },
    { label: "Browse", href: "/browse" },
  ],
  navMenuItems: [
    { label: "Home", href: "/" },
    { label: "Browse", href: "/browse" },
    { label: "Library", href: "/library" },
    { label: "Creator Dashboard", href: "/creator" },
    { label: "Login", href: "/login" },
  ],
  links: {
    discord: "https://discord.gg/sbox",
    github: "https://github.com",
  },
};
