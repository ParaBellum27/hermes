"use client";

import { Suspense } from "react";
import NavBar from "./dashboard/components/NavBar";
import { ToastContainer } from "react-toastify";
import { usePathname, useSearchParams } from "next/navigation";

function LayoutContentInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEmbed = searchParams?.get("embed") === "docs";
  const shouldShowNav = pathname !== "/" && !isEmbed;

  return (
    <>
      {/* Top nav */}
      {shouldShowNav && <NavBar />}

      {/* Page content */}
      <main className={isEmbed ? "min-h-screen" : undefined}>{children}</main>

      {/* Toasts */}
      <ToastContainer />
    </>
  );
}

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LayoutContentInner>{children}</LayoutContentInner>
    </Suspense>
  );
}
