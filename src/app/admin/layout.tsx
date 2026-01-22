"use client";

import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
      logout();
      router.push("/");
  };

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <aside className="w-64 h-auto bg-gray-900 border-r border-gray-800 hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary">CinemaX Admin</h2>
        </div>
        <nav className="mt-6 px-4 space-y-2 flex-1">
          <Link href="/admin" className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/movies" className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            Movies
          </Link>
          <Link href="/admin/showtimes" className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            Showtimes
          </Link>
          <Link href="/admin/bookings" className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            Bookings
          </Link>
          <Link href="/admin/verify" className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            Verify Ticket
          </Link>
          <Link href="/admin/complaints" className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            Complaints
          </Link>
          <div className="pt-8 mt-8 border-t border-gray-800">
             <Link href="/" className="block px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-white transition-colors">
                Back to Site
             </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800">
             <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Logout
             </button>
          </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
