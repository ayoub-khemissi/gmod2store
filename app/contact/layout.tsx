import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | s&box Store",
  description:
    "Have a question, feedback, or partnership inquiry? Get in touch with the s&box Store team.",
  openGraph: {
    title: "Contact Us | s&box Store",
    description:
      "Have a question, feedback, or partnership inquiry? Get in touch with the s&box Store team.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
