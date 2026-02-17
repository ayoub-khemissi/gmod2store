"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/button";
import clsx from "clsx";

const adminNav = [
  { label: "Overview", href: "/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Products", href: "/admin/products" },
  { label: "Tickets", href: "/admin/tickets" },
  { label: "Contacts", href: "/admin/contacts" },
  { label: "Guard", href: "/admin/guard" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex gap-6 py-8 md:py-10">
      <aside className="hidden md:flex flex-col gap-1 w-48 shrink-0">
        <p className="text-xs font-semibold text-default-400 uppercase tracking-wider mb-2 px-3">
          Admin Panel
        </p>
        {adminNav.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Button
              key={item.href}
              as={NextLink}
              className={clsx(
                "justify-start",
                isActive && "bg-primary/10 text-primary font-semibold",
              )}
              href={item.href}
              size="sm"
              variant="light"
            >
              {item.label}
            </Button>
          );
        })}
      </aside>
      <main className="flex-1 flex flex-col gap-6 min-w-0">{children}</main>
    </div>
  );
}
