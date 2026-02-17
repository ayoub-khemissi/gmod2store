"use client";

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
import { Skeleton } from "@heroui/skeleton";

import { title } from "@/components/primitives";
import { LoadingButton } from "@/components/ui/loading-button";
import type { Contact } from "@/types/contact";

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolving, setResolving] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/contacts")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setContacts(d.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleResolve = async (contactId: number) => {
    setResolving(contactId);
    try {
      const res = await fetch(`/api/admin/contacts/${contactId}`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (data.success) {
        setContacts((prev) =>
          prev.map((c) =>
            c.id === contactId ? { ...c, is_resolved: true } : c,
          ),
        );
      }
    } catch {
      //
    } finally {
      setResolving(null);
    }
  };

  if (isLoading) {
    return (
      <>
        <h1 className={title({ size: "sm" })}>Contact Submissions</h1>
        <div className="flex flex-col gap-2 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className={title({ size: "sm" })}>Contact Submissions</h1>
      <p className="text-default-500 text-sm">
        {contacts.filter((c) => !c.is_resolved).length} unresolved
      </p>

      <Table aria-label="Contacts" className="mt-2">
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>CATEGORY</TableColumn>
          <TableColumn>SUBJECT</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>DATE</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No contact submissions.">
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>{contact.name}</TableCell>
              <TableCell>
                <span className="text-xs">{contact.email}</span>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat">
                  {contact.category}
                </Chip>
              </TableCell>
              <TableCell>
                <span className="font-medium">{contact.subject}</span>
              </TableCell>
              <TableCell>
                <Chip
                  color={contact.is_resolved ? "success" : "warning"}
                  size="sm"
                  variant="flat"
                >
                  {contact.is_resolved ? "Resolved" : "Pending"}
                </Chip>
              </TableCell>
              <TableCell>
                {new Date(contact.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {!contact.is_resolved && (
                  <LoadingButton
                    color="success"
                    isLoading={resolving === contact.id}
                    size="sm"
                    variant="flat"
                    onPress={() => handleResolve(contact.id)}
                  >
                    Resolve
                  </LoadingButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
