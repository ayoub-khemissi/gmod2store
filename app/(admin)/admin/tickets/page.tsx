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
import { Tabs, Tab } from "@heroui/tabs";
import { Skeleton } from "@heroui/skeleton";
import { Button } from "@heroui/button";
import NextLink from "next/link";

import { title } from "@/components/primitives";

interface AdminTicket {
  id: number;
  subject: string;
  category: string;
  status: string;
  requester_username: string;
  requester_id: number;
  created_at: string;
  updated_at: string;
}

const statusColorMap: Record<
  string,
  "default" | "warning" | "danger" | "success"
> = {
  open: "warning",
  escalated: "danger",
  resolved: "success",
  closed: "default",
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("escalated");

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/admin/tickets?status=${activeTab}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTickets(d.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [activeTab]);

  return (
    <>
      <h1 className={title({ size: "sm" })}>Support Tickets</h1>

      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
      >
        <Tab key="escalated" title="Escalated" />
        <Tab key="open" title="Open" />
        <Tab key="resolved" title="Resolved" />
        <Tab key="closed" title="Closed" />
      </Tabs>

      {isLoading ? (
        <div className="flex flex-col gap-2 mt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : (
        <Table aria-label="Tickets" className="mt-2">
          <TableHeader>
            <TableColumn>SUBJECT</TableColumn>
            <TableColumn>CATEGORY</TableColumn>
            <TableColumn>REQUESTER</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>UPDATED</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No tickets found.">
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <span className="font-medium">{ticket.subject}</span>
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat">
                    {ticket.category}
                  </Chip>
                </TableCell>
                <TableCell>{ticket.requester_username}</TableCell>
                <TableCell>
                  <Chip
                    color={statusColorMap[ticket.status] ?? "default"}
                    size="sm"
                    variant="flat"
                  >
                    {ticket.status}
                  </Chip>
                </TableCell>
                <TableCell>
                  {new Date(ticket.updated_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    as={NextLink}
                    href={`/tickets/${ticket.id}`}
                    size="sm"
                    variant="flat"
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
