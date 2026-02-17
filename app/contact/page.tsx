"use client";

import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { useState } from "react";

import { title, subtitle } from "@/components/primitives";
import { LoadingButton } from "@/components/ui/loading-button";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) setSubmitted(true);
    } catch {
      //
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="flex flex-col items-center justify-center gap-4 py-20">
        <h1 className={title({ size: "sm", color: "green" })}>Message Sent!</h1>
        <p className="text-default-500">
          We&apos;ll get back to you as soon as possible.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6 py-8 md:py-10 max-w-xl mx-auto">
      <div className="text-center">
        <h1 className={title({ size: "sm" })}>Contact Us</h1>
        <p className={subtitle()}>
          Have a question, feedback, or partnership inquiry? Let us know.
        </p>
      </div>

      <div className="flex flex-col gap-4 glass-card p-6">
        <Input
          isRequired
          label="Name"
          value={form.name}
          variant="bordered"
          onValueChange={(v) => setForm((f) => ({ ...f, name: v }))}
        />
        <Input
          isRequired
          label="Email"
          type="email"
          value={form.email}
          variant="bordered"
          onValueChange={(v) => setForm((f) => ({ ...f, email: v }))}
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
          label="Subject"
          value={form.subject}
          variant="bordered"
          onValueChange={(v) => setForm((f) => ({ ...f, subject: v }))}
        />
        <Input
          isRequired
          label="Message"
          value={form.message}
          variant="bordered"
          onValueChange={(v) => setForm((f) => ({ ...f, message: v }))}
        />
        <LoadingButton
          color="primary"
          isDisabled={
            !form.name || !form.email || !form.subject || !form.message
          }
          isLoading={isSubmitting}
          onPress={handleSubmit}
        >
          Send Message
        </LoadingButton>
      </div>
    </section>
  );
}
