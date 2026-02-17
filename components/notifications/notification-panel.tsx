"use client";

import type { Notification } from "@/types/notification";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/dropdown";
import { Skeleton } from "@heroui/skeleton";
import NextLink from "next/link";

export const NotificationPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setNotifications(d.data.notifications);
          setUnread(d.data.unread);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  };

  const handleMarkRead = async (id: number) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    setUnread((prev) => Math.max(0, prev - 1));
  };

  if (isLoading) {
    return <Skeleton className="w-8 h-8 rounded-full" />;
  }

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          isIconOnly
          aria-label="Notifications"
          radius="full"
          size="sm"
          variant="light"
        >
          <Badge
            color="danger"
            content={unread > 0 ? unread : undefined}
            isInvisible={unread === 0}
            shape="circle"
            size="sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Badge>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Notifications"
        className="w-80 max-h-96 overflow-y-auto"
      >
        <DropdownSection showDivider>
          <DropdownItem
            key="header"
            isReadOnly
            className="cursor-default"
            textValue="Notifications header"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">Notifications</p>
              {unread > 0 && (
                <Button
                  className="text-xs"
                  color="primary"
                  size="sm"
                  variant="light"
                  onPress={handleMarkAllRead}
                >
                  Mark all read
                </Button>
              )}
            </div>
          </DropdownItem>
        </DropdownSection>
        <DropdownSection>
          {notifications.length === 0 ? (
            <DropdownItem
              key="empty"
              isReadOnly
              className="cursor-default"
              textValue="No notifications"
            >
              <p className="text-sm text-default-400 text-center py-4">
                No notifications yet.
              </p>
            </DropdownItem>
          ) : (
            notifications.slice(0, 10).map((n) => (
              <DropdownItem
                key={n.id}
                as={n.link ? NextLink : undefined}
                className={n.is_read ? "opacity-60" : ""}
                href={n.link ?? undefined}
                textValue={n.title}
                onPress={() => !n.is_read && handleMarkRead(n.id)}
              >
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-default-400">{n.message}</p>
                  <p className="text-xs text-default-300 mt-1">
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </div>
              </DropdownItem>
            ))
          )}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
