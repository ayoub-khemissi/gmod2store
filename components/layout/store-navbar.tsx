"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Skeleton } from "@heroui/skeleton";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { useMotionValueEvent, useScroll, motion } from "framer-motion";
import { useState } from "react";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon } from "@/components/icons";
import { SearchCommand } from "@/components/search/search-command";
import { UserMenu } from "@/components/auth/user-menu";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import { useAuth } from "@/lib/auth-context";

export const StoreNavbar = () => {
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const { user, isLoading } = useAuth();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;

    if (latest > previous && latest > 80) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <>
      <SearchCommand />
      <motion.div
        animate={{ y: hidden ? "-100%" : "0%" }}
        className="fixed top-0 left-0 right-0 z-50"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <HeroUINavbar
          classNames={{
            base: "glass border-b border-white/5",
            wrapper: "max-w-7xl",
          }}
          maxWidth="xl"
          position="static"
        >
          <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
            <NavbarBrand as="li" className="gap-3 max-w-fit">
              <NextLink
                className="flex justify-start items-center gap-1"
                href="/"
              >
                <p className="font-bold text-inherit font-[family-name:var(--font-heading)] text-lg">
                  s&box Store
                </p>
              </NextLink>
            </NavbarBrand>
            <ul className="hidden lg:flex gap-4 justify-start ml-2">
              {siteConfig.navItems.map((item) => (
                <NavbarItem key={item.href}>
                  <NextLink
                    className={clsx(
                      linkStyles({ color: "foreground" }),
                      "data-[active=true]:text-primary data-[active=true]:font-medium",
                    )}
                    color="foreground"
                    href={item.href}
                  >
                    {item.label}
                  </NextLink>
                </NavbarItem>
              ))}
            </ul>
          </NavbarContent>

          <NavbarContent
            className="hidden sm:flex basis-1/5 sm:basis-full"
            justify="end"
          >
            <NavbarItem className="hidden sm:flex gap-2">
              <ThemeSwitch />
            </NavbarItem>
            <NavbarItem className="hidden lg:flex">
              <Button
                aria-label="Search products"
                className="bg-default-100 text-default-500 text-sm"
                endContent={
                  <Kbd className="hidden lg:inline-block" keys={["command"]}>
                    K
                  </Kbd>
                }
                startContent={
                  <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
                }
                variant="flat"
                onPress={() => {
                  document.dispatchEvent(
                    new KeyboardEvent("keydown", {
                      key: "k",
                      metaKey: true,
                    }),
                  );
                }}
              >
                Search products...
              </Button>
            </NavbarItem>
            <NavbarItem className="hidden md:flex items-center gap-2">
              {isLoading ? (
                <Skeleton className="w-10 h-10 rounded-full" />
              ) : user ? (
                <>
                  <NotificationPanel />
                  <UserMenu
                    avatarUrl={user.avatar_url}
                    role={user.role}
                    username={user.username}
                  />
                </>
              ) : (
                <Button
                  as={NextLink}
                  color="primary"
                  href="/login"
                  variant="flat"
                >
                  Sign in with Steam
                </Button>
              )}
            </NavbarItem>
          </NavbarContent>

          <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
            <ThemeSwitch />
            <NavbarMenuToggle />
          </NavbarContent>

          <NavbarMenu>
            <div className="mx-4 mt-2 flex flex-col gap-2">
              {siteConfig.navMenuItems.map((item, index) => (
                <NavbarMenuItem key={`${item.href}-${index}`}>
                  <Link color="foreground" href={item.href} size="lg">
                    {item.label}
                  </Link>
                </NavbarMenuItem>
              ))}
            </div>
          </NavbarMenu>
        </HeroUINavbar>
      </motion.div>
    </>
  );
};
