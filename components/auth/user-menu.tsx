"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { useRouter } from "next/navigation";

import type { UserRole } from "@/types/user";

import { useAuth } from "@/lib/auth-context";

interface UserMenuProps {
  username: string;
  avatarUrl: string;
  role: UserRole;
}

export const UserMenu = ({ username, avatarUrl, role }: UserMenuProps) => {
  const { refresh } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout");
    await refresh();
    router.push("/");
  };

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform cursor-pointer"
          name={username}
          size="sm"
          src={avatarUrl}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="User menu">
        <DropdownSection showDivider>
          <DropdownItem key="profile" className="h-14 gap-2" isReadOnly>
            <p className="font-semibold">Signed in as</p>
            <p className="font-semibold">{username}</p>
          </DropdownItem>
        </DropdownSection>
        <DropdownSection showDivider>
          <DropdownItem key="library" href="/library">
            Library
          </DropdownItem>
          {(role === "creator" || role === "admin") ? (
            <DropdownItem key="creator" href="/creator">
              Creator Dashboard
            </DropdownItem>
          ) : (
            <DropdownItem key="become-creator" href="/creator">
              Become a Creator
            </DropdownItem>
          )}
          {role === "admin" ? (
            <DropdownItem key="admin" href="/admin">
              Admin Panel
            </DropdownItem>
          ) : null}
        </DropdownSection>
        <DropdownSection>
          <DropdownItem key="logout" color="danger" onPress={handleLogout}>
            Log Out
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
