"use client";

import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div>
       <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name}</h1>
       <p className="text-gray-400 mb-8">Here's what's happening with your cinema account.</p>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
             <h3 className="text-gray-400 text-sm font-medium mb-2">QUICK ACTIONS</h3>
             <div className="space-y-4">
                <Link href="/dashboard/bookings" className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors">
                    <span className="text-white font-medium">View My Bookings</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </Link>
                <Link href="/" className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors">
                    <span className="text-white font-medium">Book a New Movie</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </Link>
             </div>
          </div>
          
           <div className="bg-gradient-to-br from-primary/20 to-gray-900 rounded-2xl p-6 border border-primary/20">
               <h3 className="text-primary text-sm font-bold mb-2 tracking-wider">UPCOMING</h3>
               <p className="text-gray-300 mb-6">You have no upcoming movies. Why not change that?</p>
               <Link href="/" className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors">
                  Browse Movies
               </Link>
           </div>
       </div>
    </div>
  );
}
