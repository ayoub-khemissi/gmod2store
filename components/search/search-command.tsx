"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Modal, ModalContent, ModalBody, useDisclosure } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Kbd } from "@heroui/kbd";
import { Spinner } from "@heroui/spinner";
import NextLink from "next/link";

import { SearchIcon } from "@/components/icons";

interface SearchResult {
  id: number;
  title: string;
  slug: string;
  category: string;
  price: number;
}

export const SearchCommand = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpen]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);

      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/products/search?q=${encodeURIComponent(q)}`,
      );
      const data = await res.json();

      if (data.success) {
        setResults(data.data);
      }
    } catch {
      //
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(searchQuery), 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, search]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      onClose();
      window.location.href = `/product/${results[selectedIndex].slug}`;
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setResults([]);
    onClose();
  };

  return (
    <Modal
      hideCloseButton
      isOpen={isOpen}
      placement="top"
      size="lg"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalBody className="p-0">
          <Input
            ref={inputRef}
            classNames={{
              inputWrapper: "bg-transparent shadow-none border-b rounded-none",
              input: "text-base",
            }}
            endContent={
              isSearching ? (
                <Spinner size="sm" />
              ) : (
                <Kbd className="hidden sm:inline-block">ESC</Kbd>
              )
            }
            placeholder="Search products..."
            size="lg"
            startContent={
              <SearchIcon className="text-default-400 flex-shrink-0" />
            }
            value={searchQuery}
            onKeyDown={handleKeyDown}
            onValueChange={setSearchQuery}
          />

          {results.length > 0 && (
            <div className="max-h-80 overflow-y-auto p-2">
              {results.map((result, i) => (
                <NextLink
                  key={result.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    i === selectedIndex
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-default-100"
                  }`}
                  href={`/product/${result.slug}`}
                  onClick={handleClose}
                >
                  <div>
                    <p className="font-medium text-sm">{result.title}</p>
                    <p className="text-xs text-default-400">
                      {result.category}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    {result.price === 0 ? "Free" : `$${result.price}`}
                  </p>
                </NextLink>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && results.length === 0 && !isSearching && (
            <div className="p-6 text-center">
              <p className="text-default-400 text-sm">No products found.</p>
            </div>
          )}

          {searchQuery.length < 2 && (
            <div className="p-6 text-center">
              <p className="text-default-400 text-sm">
                Type at least 2 characters to search...
              </p>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
