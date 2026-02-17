import { title, subtitle } from "@/components/primitives";

interface SectionHeadingProps {
  heading: string;
  description?: string;
  color?: Parameters<typeof title>[0] extends infer T
    ? T extends { color?: infer C }
      ? C
      : never
    : never;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
}

export const SectionHeading = ({
  heading,
  description,
  color,
  size = "md",
  align = "left",
}: SectionHeadingProps) => {
  return (
    <div
      className={
        align === "center" ? "text-center" : ""
      }
    >
      <h2
        className={title({
          size,
          color,
          class: "font-[family-name:var(--font-heading)]",
        })}
      >
        {heading}
      </h2>
      {description && (
        <p className={subtitle({ class: align === "center" ? "mx-auto" : "" })}>
          {description}
        </p>
      )}
    </div>
  );
};
