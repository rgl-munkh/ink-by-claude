"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  const pathname = usePathname();

  // Hide header and footer for booking routes
  const isBookingRoute = pathname && pathname.endsWith('/book');

  if (isBookingRoute) {
    return (
      <main className="min-h-screen bg-white p-6">
        {children}
      </main>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
};