"use client";

import { Card } from "@heroui/card";
import clsx from "clsx";
import { ComponentProps } from "react";

type CardBaseProps = ComponentProps<typeof Card>;

interface GlassCardOwnProps {
  intensity?: "subtle" | "default" | "strong";
  glow?: "none" | "primary" | "secondary";
  backgroundImage?: string;
}

type GlassCardProps = CardBaseProps & GlassCardOwnProps;

export const GlassCard = ({
  intensity = "default",
  glow = "none",
  backgroundImage,
  className,
  style,
  children,
  ...props
}: GlassCardProps) => {
  const intensityClasses = {
    subtle: "glass-subtle",
    default: "glass-card",
    strong: "glass-card backdrop-blur-[var(--blur-glass-strong)]",
  };

  const glowClasses = {
    none: "",
    primary: "glow-primary",
    secondary: "glow-secondary",
  };

  return (
    <Card
      className={clsx(
        intensityClasses[intensity],
        glowClasses[glow],
        "bg-transparent",
        className,
      )}
      style={{
        ...(backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </Card>
  );
};
