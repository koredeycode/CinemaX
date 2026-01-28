"use client"

import SearchMovies from "@/components/SearchMovies";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";


import SessionTimer from "./SessionTimer";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { currentSession, cart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate item count (number of booking sessions)
  const hasCurrentSession = currentSession && (currentSession.seats.length > 0 || currentSession.concessions.length > 0);
  const itemCount = cart.length + (hasCurrentSession ? 1 : 0);

  return (
    <nav className="border-b border-gray-800 bg-black/80 sticky top-0 z-50 backdrop-blur-md">
      <SessionTimer />
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0">
          <img src="/icon.png" alt="CinemaX" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-bold text-primary tracking-tighter hidden md:block">CinemaX</span>
        </Link>
        
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <SearchMovies />
        </div>
        
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/checkout" className="relative group">
             <div className="p-2 text-gray-400 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                {mounted && itemCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                    {itemCount}
                  </span>
                )}
             </div>
          </Link>

          <Link 
            href="/" 
            className={clsx("text-sm transition-colors hover:text-white hidden sm:block", pathname === "/" ? "text-white font-medium" : "text-gray-400")}
          >
            Movies
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
               <Link 
                  href={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="text-sm bg-gray-800 px-4 py-2 rounded-lg text-white hover:bg-gray-700 transition-colors font-medium"
               >
                  Dashboard
               </Link>
            </div>
          ) : (
             <div className="flex items-center gap-4">
               <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                 Login
               </Link>
               <Link href="/register" className="text-sm bg-primary px-4 py-2 rounded text-white hover:bg-red-700 transition-colors font-medium">
                 Sign Up
               </Link>
             </div>
          )}
        </div>
      </div>
    </nav>
  );
}
