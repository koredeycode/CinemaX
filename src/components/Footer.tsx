"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");

    if (isDashboard) return null;

    return (
      <footer className="border-t border-gray-800 bg-black py-8 mt-auto">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-xl font-bold text-primary">CinemaX</h2>
            <p className="text-gray-500 text-sm max-w-md">
              The best place to book your tickets. Experience movies like never before in our state-of-the-art theaters.
            </p>
            <div className="text-gray-600 text-xs">
              &copy; {new Date().getFullYear()} CinemaX Inc. All rights reserved.
            </div>
        </div>
      </footer>
    );
  }
