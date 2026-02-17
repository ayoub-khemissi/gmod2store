"use client";

import { useState } from "react";

import { LoadingButton } from "@/components/ui/loading-button";
import { useAuth } from "@/lib/auth-context";

interface BuyButtonProps {
  productId: number;
  price: number;
  owned: boolean;
}

export const BuyButton = ({ productId, price, owned }: BuyButtonProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleBuy = async () => {
    if (!user) {
      window.location.href = "/login";

      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();

      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      }
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  if (owned) {
    return (
      <LoadingButton color="success" size="lg" variant="flat">
        Owned
      </LoadingButton>
    );
  }

  return (
    <LoadingButton
      color="primary"
      isLoading={isLoading}
      size="lg"
      variant="shadow"
      onPress={handleBuy}
    >
      {price === 0 ? "Get for Free" : `Buy — $${price.toFixed(2)}`}
    </LoadingButton>
  );
};
