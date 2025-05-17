"use client";

import { usePathname } from "next/navigation";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

export default function LayoutVisibilityWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <>
      {!isDashboard && <Navbar />}
      {children}
      {!isDashboard && <Footer />}
    </>
  );
}
