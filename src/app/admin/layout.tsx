"use client";

import Sidebar from "@/components/Sidebar";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, hasHydrated } = useAuthStore();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (hasHydrated) {
      if (!token || !user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [hasHydrated, token, user, router]);

  if (!mounted || !hasHydrated || !user || user.role !== "admin") return null;

  const adminNavItems = [
    { name: "Dashboard", href: "/admin", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" },
    { name: "Movies", href: "/admin/movies", icon: "M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375a1.125 1.125 0 01-1.125-1.125m17.25 0H3.375m18.375 0v1.5c0 .621-.504 1.125-1.125 1.125m0-2.625c.621 0 1.125.504 1.125 1.125m-1.125-1.125v1.5c0 .621.504 1.125 1.125 1.125m-1.125 0H6m12.75 0h-1.5A1.125 1.125 0 0116.125 4.5H18.375M6 4.5v1.5c0 .621-.504 1.125-1.125 1.125H3.375" },
    { name: "Bookings", href: "/admin/bookings", icon: "M16.5 6a3 3 0 00-3-3H6a3 3 0 00-3 3v7.5a3 3 0 003 3v-7.5a3 3 0 013-3h7.5V6z M18 10.5a3 3 0 00-3-3H9a3 3 0 00-3 3v7.5a3 3 0 003 3h6a3 3 0 003-3v-7.5z" },
    { name: "Verify Ticket", href: "/admin/verify", icon: "M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.088v5.61c0 1.18.96 2.175 2.175 2.175h7.5c1.18 0 2.175-.995 2.175-2.175V6.19c0-1.115-.845-2.078-1.976-2.171a41.32 41.32 0 00-1.125-.08M10.5 8.25h3.75a.75.75 0 00.75-.75v-1.5a.75.75 0 00-.75-.75H10.5a.75.75 0 00-.75.75v1.5a.75.75 0 00.75.75z" },
    { name: "Complaints", href: "/admin/complaints", icon: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" },
    { name: "Back to Site", href: "/", icon: "M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900 sticky top-16 z-30">
         <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
           <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        </div>
      </div>

      <div className="flex">
        <Sidebar 
          title="CinemaX Admin" 
          items={adminNavItems} 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Main Content */}
        <main className="flex-1 min-w-0 md:pl-64">
           <div className="p-4 md:p-8">
               {children}
           </div>
        </main>
      </div>
    </div>
  );
}
