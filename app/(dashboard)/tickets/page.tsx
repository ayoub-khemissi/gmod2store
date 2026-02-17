"use client";

import type { Ticket } from "@/types/ticket";

import { useState, useEffect } from "react";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Skeleton } from "@heroui/skeleton";
import NextLink from "next/link";

import { title } from "@/components/primitives";
import { LoadingButton } from "@/components/ui/loading-button";
import { GlassCard } from "@/components/ui/glass-card";

const statusColorMap: Record<
  string,
  "default" | "primary" | "success" | "warning" | "danger"
> = {
  open: "primary",
  in_progress: "warning",
  resolved: "success",
  escalated: "danger",
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    category: "general",
    message: "",
  });

  useEffect(() => {
    fetch("/api/tickets")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTickets(d.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        setTickets((prev) => [data.data, ...prev]);
        onClose();
        setForm({ subject: "", category: "general", message: "" });
      }
    } catch {
      //
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className={title({ size: "sm" })}>My Tickets</h1>
        <Button color="primary" onPress={onOpen}>
          New Ticket
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <p className="text-default-400 text-center py-12">No tickets yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((ticket) => (
            <GlassCard
              key={ticket.id}
              isPressable
              as={NextLink}
              href={`/tickets/${ticket.id}`}
            >
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{ticket.subject}</p>
                  <p className="text-default-400 text-sm">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Chip
                  color={statusColorMap[ticket.status]}
                  size="sm"
                  variant="flat"
                >
                  {ticket.status}
                </Chip>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Create Ticket</ModalHeader>
          <ModalBody className="flex flex-col gap-3">
            <Input
              isRequired
              label="Subject"
              value={form.subject}
              variant="bordered"
              onValueChange={(v) => setForm((f) => ({ ...f, subject: v }))}
            />
            <Select
              label="Category"
              selectedKeys={[form.category]}
              variant="bordered"
              onSelectionChange={(keys) =>
                setForm((f) => ({
                  ...f,
                  category: Array.from(keys)[0] as string,
                }))
              }
            >
              <SelectItem key="general">General</SelectItem>
              <SelectItem key="bug_report">Bug Report</SelectItem>
              <SelectItem key="partnership">Partnership</SelectItem>
              <SelectItem key="other">Other</SelectItem>
            </Select>
            <Input
              isRequired
              label="Message"
              value={form.message}
              variant="bordered"
              onValueChange={(v) => setForm((f) => ({ ...f, message: v }))}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <LoadingButton
              color="primary"
              isDisabled={!form.subject || !form.message}
              isLoading={isSubmitting}
              onPress={handleCreate}
            >
              Create
            </LoadingButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
