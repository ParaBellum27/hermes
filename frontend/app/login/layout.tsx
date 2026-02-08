import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | hermes",
  description: "Sign in to hermes",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
