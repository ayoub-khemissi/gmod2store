"use client";

import type { UserRole } from "@/types/user";

import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Select, SelectItem } from "@heroui/select";
import { Skeleton } from "@heroui/skeleton";

import { title } from "@/components/primitives";

interface AdminUser {
  id: number;
  steam_id: string;
  username: string;
  avatar_url: string;
  role: UserRole;
  slug: string | null;
  created_at: string;
}

const roleColorMap: Record<UserRole, "default" | "primary" | "danger"> = {
  buyer: "default",
  creator: "primary",
  admin: "danger",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUsers(d.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();

    if (data.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: newRole as UserRole } : u,
        ),
      );
    }
  };

  if (isLoading) {
    return (
      <>
        <h1 className={title({ size: "sm" })}>Manage Users</h1>
        <div className="flex flex-col gap-2 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className={title({ size: "sm" })}>Manage Users</h1>
      <p className="text-default-500 text-sm">
        {users.length} registered users
      </p>

      <Table aria-label="Users" className="mt-2">
        <TableHeader>
          <TableColumn>USER</TableColumn>
          <TableColumn>STEAM ID</TableColumn>
          <TableColumn>ROLE</TableColumn>
          <TableColumn>JOINED</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No users found.">
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar
                    name={user.username}
                    size="sm"
                    src={user.avatar_url}
                  />
                  <span className="font-medium">{user.username}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs text-default-400">
                  {user.steam_id}
                </span>
              </TableCell>
              <TableCell>
                <Chip color={roleColorMap[user.role]} size="sm" variant="flat">
                  {user.role}
                </Chip>
              </TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Select
                  aria-label="Change role"
                  className="w-32"
                  selectedKeys={[user.role]}
                  size="sm"
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const role = Array.from(keys)[0] as string;

                    if (role && role !== user.role) {
                      handleRoleChange(user.id, role);
                    }
                  }}
                >
                  <SelectItem key="buyer">Buyer</SelectItem>
                  <SelectItem key="creator">Creator</SelectItem>
                  <SelectItem key="admin">Admin</SelectItem>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
