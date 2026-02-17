"use client";

import { Button, ButtonProps } from "@heroui/button";
import { Spinner } from "@heroui/spinner";

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
}

export const LoadingButton = ({
  isLoading = false,
  children,
  isDisabled,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button isDisabled={isLoading || isDisabled} {...props}>
      {isLoading ? <Spinner color="current" size="sm" /> : children}
    </Button>
  );
};
