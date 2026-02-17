import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | s&box Store",
  description:
    "Sign in with your Steam account to access your library, manage products, and more.",
  openGraph: {
    title: "Sign In | s&box Store",
    description:
      "Sign in with your Steam account to access your library, manage products, and more.",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
