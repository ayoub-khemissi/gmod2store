"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";

import { title } from "@/components/primitives";
import { LoadingButton } from "@/components/ui/loading-button";

interface TicketMessage {
  id: number;
  content: string;
  created_at: string;
  username: string;
  avatar_url: string;
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<{
    subject: string;
    status: string;
    category: string;
  } | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetch(`/api/tickets/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setTicket(d.data.ticket);
          setMessages(d.data.messages);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setIsSending(true);
    try {
      await fetch(`/api/tickets/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });
      setNewMessage("");
      // Refresh messages
      const res = await fetch(`/api/tickets/${id}`);
      const d = await res.json();

      if (d.success) setMessages(d.data.messages);
    } catch {
      //
    } finally {
      setIsSending(false);
    }
  };

  const handleAction = async (action: "escalate" | "resolve") => {
    await fetch(`/api/tickets/${id}/${action}`, { method: "POST" });
    const res = await fetch(`/api/tickets/${id}`);
    const d = await res.json();

    if (d.success) setTicket(d.data.ticket);
  };

  if (isLoading) {
    return (
      <>
        <Skeleton className="h-8 w-64 rounded-lg" />
        <div className="flex flex-col gap-3 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </>
    );
  }

  if (!ticket) return <p className="text-default-400">Ticket not found.</p>;

  return (
    <>
      <div className="flex items-center gap-3">
        <h1 className={title({ size: "sm" })}>{ticket.subject}</h1>
        <Chip size="sm" variant="flat">
          {ticket.status}
        </Chip>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3 mt-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3 glass-card p-4">
            <Avatar
              className="flex-shrink-0"
              name={msg.username}
              size="sm"
              src={msg.avatar_url}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{msg.username}</span>
                <span className="text-default-400 text-xs">
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-default-600 text-sm mt-1">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reply */}
      {ticket.status !== "resolved" && (
        <div className="flex gap-3 mt-4">
          <Input
            className="flex-1"
            placeholder="Type a reply..."
            value={newMessage}
            variant="bordered"
            onValueChange={setNewMessage}
          />
          <LoadingButton
            color="primary"
            isLoading={isSending}
            onPress={sendMessage}
          >
            Send
          </LoadingButton>
        </div>
      )}

      {/* Actions */}
      {ticket.status !== "resolved" && (
        <div className="flex gap-3 mt-4">
          <Button
            color="warning"
            size="sm"
            variant="flat"
            onPress={() => handleAction("escalate")}
          >
            Escalate
          </Button>
          <Button
            color="success"
            size="sm"
            variant="flat"
            onPress={() => handleAction("resolve")}
          >
            Mark Resolved
          </Button>
        </div>
      )}
    </>
  );
}
