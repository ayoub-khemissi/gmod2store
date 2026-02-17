"use client";

import { Button } from "@heroui/button";
import { Link } from "@heroui/link";

export const SteamLoginButton = () => {
  return (
    <Button
      as={Link}
      color="primary"
      href="/api/auth/steam"
      size="lg"
      variant="shadow"
    >
      Sign in with Steam
    </Button>
  );
};
