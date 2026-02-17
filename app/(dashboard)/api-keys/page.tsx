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
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Skeleton } from "@heroui/skeleton";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Code } from "@heroui/code";

import { title } from "@/components/primitives";
import { LoadingButton } from "@/components/ui/loading-button";
import type { ApiKey } from "@/types/api-key";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetch("/api/v1/keys")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setKeys(d.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/v1/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();

      if (data.success) {
        setCreatedKey(data.data.full_key);
        setKeys((prev) => [data.data, ...prev]);
        setNewKeyName("");
      }
    } catch {
      //
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (keyId: number) => {
    await fetch(`/api/v1/keys?id=${keyId}`, { method: "DELETE" });
    setKeys((prev) =>
      prev.map((k) => (k.id === keyId ? { ...k, is_active: false } : k)),
    );
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className={title({ size: "sm" })}>API Keys</h1>
        <Button color="primary" onPress={onOpen}>
          Create Key
        </Button>
      </div>

      <p className="text-default-500 text-sm">
        Use API keys to verify licenses from your s&box game servers.
      </p>

      {createdKey && (
        <div className="glass-card p-4 mt-4">
          <p className="text-sm font-semibold text-warning mb-2">
            Copy this key now — you won&apos;t be able to see it again!
          </p>
          <Code className="break-all">{createdKey}</Code>
          <Button
            className="mt-2"
            size="sm"
            variant="flat"
            onPress={() => setCreatedKey(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : (
        <Table aria-label="API keys" className="mt-4">
          <TableHeader>
            <TableColumn>NAME</TableColumn>
            <TableColumn>PREFIX</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>CREATED</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No API keys yet.">
            {keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell>{key.name}</TableCell>
                <TableCell>
                  <Code size="sm">{key.key_prefix}...</Code>
                </TableCell>
                <TableCell>
                  <Chip
                    color={key.is_active ? "success" : "danger"}
                    size="sm"
                    variant="flat"
                  >
                    {key.is_active ? "Active" : "Revoked"}
                  </Chip>
                </TableCell>
                <TableCell>
                  {new Date(key.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {key.is_active && (
                    <Button
                      color="danger"
                      size="sm"
                      variant="flat"
                      onPress={() => handleRevoke(key.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Create API Key</ModalHeader>
          <ModalBody>
            <Input
              isRequired
              label="Key Name"
              placeholder="My game server"
              value={newKeyName}
              variant="bordered"
              onValueChange={setNewKeyName}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <LoadingButton
              color="primary"
              isDisabled={!newKeyName.trim()}
              isLoading={isCreating}
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
