"use client";

import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Booking {
    _id: string;
    date: string;
    time: string;
    movieId: {
        _id: string;
        title: string;
        posterUrl: string;
        slug: string;
    };
    seats: string[];
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingBooking = async () => {
        try {
            const res = await fetch("/api/user/bookings");
            const data = await res.json();
            if (data.success && data.bookings.length > 0) {
                const now = new Date();
                
                // Helper to parse booking date string and time string into a Date object
                const getBookingDate = (b: Booking) => {
                    try {
                        // Assuming b.date is parsable and b.time is roughly "HH:MM" or "HH:MM AM/PM"
                        // If b.date is an ISO string, it might have time component 00:00:00
                        const d = new Date(b.date);
                        
                        // Attempt to parse time if it exists
                        if (b.time) {
                           // simple check for AM/PM
                           const isPM = b.time.toLowerCase().includes('pm');
                           const isAM = b.time.toLowerCase().includes('am');
                           let [hoursStr, minutesStr] = b.time.replace(/(am|pm)/i, '').trim().split(':');
                           
                           let hours = parseInt(hoursStr, 10);
                           const minutes = parseInt(minutesStr, 10) || 0;

                           if (isPM && hours < 12) hours += 12;
                           if (isAM && hours === 12) hours = 0;
                           
                           if (!isNaN(hours)) {
                               d.setHours(hours);
                               d.setMinutes(minutes);
                           }
                        }
                        return d;
                    } catch (e) {
                        return new Date(0); // invalid dates go to epoch
                    }
                };

                const upcoming = data.bookings
                    .map((b: Booking) => ({ ...b, parsedDate: getBookingDate(b) }))
                    .filter((b: any) => b.parsedDate > now)
                    .sort((a: any, b: any) => a.parsedDate.getTime() - b.parsedDate.getTime());

                if (upcoming.length > 0) {
                    setUpcomingBooking(upcoming[0]);
                } else {
                    setUpcomingBooking(null);
                }
            }
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    if (user) {
        fetchUpcomingBooking();
    }
  }, [user]);

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
          
           <div className="bg-gradient-to-br from-primary/20 to-gray-900 rounded-2xl p-6 border border-primary/20 relative overflow-hidden">
               <h3 className="text-primary text-sm font-bold mb-2 tracking-wider">UPCOMING MOVIE</h3>
               
               {loading ? (
                   <div className="animate-pulse flex gap-4 mt-4">
                       <div className="w-24 h-36 bg-gray-700 rounded-lg"></div>
                       <div className="flex-1 space-y-2 py-2">
                           <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                           <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                       </div>
                   </div>
               ) : upcomingBooking ? (
                   <div className="flex gap-4 mt-4 relative z-10">
                       <img 
                            src={upcomingBooking.movieId.posterUrl} 
                            alt={upcomingBooking.movieId.title}
                            className="w-24 h-36 object-cover rounded-lg shadow-lg"
                       />
                       <div>
                           <h4 className="text-xl font-bold text-white mb-1">{upcomingBooking.movieId.title}</h4>
                           <p className="text-gray-300 text-sm mb-2">
                               {upcomingBooking.date} • {upcomingBooking.time}
                           </p>
                           <p className="text-gray-400 text-xs mb-3">
                               {upcomingBooking.seats.length} Tickets • {upcomingBooking.seats.join(", ")}
                           </p>
                           <Link 
                                href="/dashboard/bookings"
                                className="inline-block bg-primary text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                           >
                                View Ticket
                           </Link>
                       </div>
                   </div>
               ) : (
                   <div>
                        <p className="text-gray-300 mb-6">You have no upcoming movies. Why not change that?</p>
                        <Link href="/" className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors">
                            Browse Movies
                        </Link>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
}
