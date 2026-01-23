"use client";

import { BookingCardSkeleton } from "@/components/skeletons/BookingCardSkeleton";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";


interface Booking {
  _id: string;
  movie: {
     title: string;
     posterUrl: string;
  };
  date: string;
  time: string;
  totalPrice: number;
  status: string;
  seats: string[];
  createdAt: string;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/bookings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBookings(data.bookings);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
     return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">My Bookings</h1>
            <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                    <BookingCardSkeleton key={i} />
                ))}
            </div>
        </div>
     );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">My Bookings</h1>
      
      {bookings.length === 0 ? (
          <div className="text-center py-20 bg-gray-900 rounded-2xl border border-gray-800">
             <p className="text-gray-400 mb-4">You haven't made any bookings yet.</p>
             <Link href="/" className="text-primary hover:underline">Browse Movies</Link>
          </div>
      ) : (
          <div className="grid gap-4">
             {bookings.map((booking) => (
                 <div key={booking._id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex gap-4 items-center">
                    <div className="w-16 h-24 relative bg-gray-800 rounded-lg overflow-hidden shrink-0">
                         {booking.movie?.posterUrl && (
                             <Image 
                                src={booking.movie.posterUrl} 
                                alt={booking.movie.title}
                                fill
                                className="object-cover"
                             />
                         )}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-white text-lg">{booking.movie?.title || "Unknown Movie"}</h3>
                                <p className="text-gray-400 text-sm">
                                    {(() => {
                                        if (!booking.date || !booking.time) return "N/A";
                                        try {
                                            const dateStr = new Date(booking.date).toLocaleDateString(undefined, {
                                                weekday: "short", month: "short", day: "numeric"
                                            });
                                            return `${dateStr} @ ${booking.time}`;
                                        } catch (e) {
                                            return `${booking.date} @ ${booking.time}`;
                                        }
                                    })()}
                                </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                                booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                'bg-red-500/20 text-red-500'
                            }`}>
                                {booking.status}
                            </span>
                        </div>
                        
                        <div className="mt-2 flex justify-between items-end">
                            <p className="text-sm text-gray-500">{booking.seats.length} Tickets • {booking.seats.join(", ")}</p>
                            <Link 
                                href={`/dashboard/tickets/${booking._id}`}
                                className="text-sm bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                View Ticket
                            </Link>
                        </div>
                    </div>
                 </div>
             ))}
          </div>
      )}
    </div>
  );
}
