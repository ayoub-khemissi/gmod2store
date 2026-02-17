import { Button } from "@heroui/button";
import { Link } from "@heroui/link";

import { title, subtitle } from "@/components/primitives";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl mb-12">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-mesh" />
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 bg-radial-glow" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center py-20 md:py-32 px-6">
        <h1
          className={title({
            size: "lg",
            class: "font-[family-name:var(--font-heading)]",
          })}
        >
          The marketplace for{" "}
          <span className={title({ size: "lg", color: "violet" })}>s&box</span>
        </h1>
        <h1
          className={title({
            size: "lg",
            class: "font-[family-name:var(--font-heading)] mt-2",
          })}
        >
          creators and players.
        </h1>

        <p className={subtitle({ class: "mt-6 max-w-xl mx-auto" })}>
          Discover gamemodes, tools, maps, and assets built for Source 2. Buy,
          sell, and share with the community.
        </p>

        <div className="flex gap-4 mt-8">
          <Button
            as={Link}
            className="font-[family-name:var(--font-heading)] font-semibold"
            color="primary"
            href="/browse"
            radius="full"
            size="lg"
            variant="shadow"
          >
            Browse Products
          </Button>
          <Button
            as={Link}
            className="font-[family-name:var(--font-heading)] font-semibold glass"
            href="/login"
            radius="full"
            size="lg"
            variant="bordered"
          >
            Sign in with Steam
          </Button>
        </div>
      </div>
    </section>
  );
};
