"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Suspense } from "react";


function AdminBookingsContent() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            
            const res = await fetch(`/api/bookings?${params.toString()}`);
            const data = await res.json();
            
            if (data.success) {
                setBookings(data.data);
            } else {
                toast.error("Failed to load bookings");
            }
        } catch (error) {
            console.error("Failed to fetch bookings", error);
            toast.error("Failed to fetch bookings");
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBookings();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-white">Bookings</h1>
                
                 <div className="w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="Search by name, email, or booking ID..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-2 w-full md:w-96 focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-800 text-white uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Guest</th>
                            <th className="px-6 py-4">Movie</th>
                            <th className="px-6 py-4">Seats</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                             Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><Skeleton className="w-20 h-4" /></td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <Skeleton className="w-32 h-4" />
                                            <Skeleton className="w-24 h-3" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                         <div className="space-y-1">
                                             <Skeleton className="w-40 h-4" />
                                             <Skeleton className="w-24 h-3" />
                                         </div>
                                    </td>
                                    <td className="px-6 py-4"><Skeleton className="w-24 h-4" /></td>
                                    <td className="px-6 py-4"><Skeleton className="w-16 h-4" /></td>
                                    <td className="px-6 py-4"><Skeleton className="w-24 h-4" /></td>
                                </tr>
                            ))
                        ) : bookings.length > 0 ? (
                            bookings.map((booking: any) => (
                                <tr key={String(booking._id)} className="hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500 hover:text-white transition-colors">
                                        {String(booking._id).substring(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white font-medium">{booking.guestDetails?.name || "N/A"}</div>
                                        <div className="text-xs">{booking.guestDetails?.email || booking.userEmail}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {booking.movie?.title || "Unknown"}
                                        <div className="text-xs text-gray-500">
                                           {(() => {
                                                if (!booking.date || !booking.time) return "N/A";
                                                try {
                                                    const dateStr = new Date(booking.date).toLocaleDateString();
                                                    return `${dateStr} @ ${booking.time}`;
                                                } catch (e) {
                                                    return `${booking.date} @ ${booking.time}`;
                                                }
                                           })()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{booking.seats.join(", ")}</td>
                                    <td className="px-6 py-4 text-primary font-bold">₦{booking.totalPrice?.toLocaleString()}</td>
                                    <td className="px-6 py-4">{new Date(booking.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No bookings found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function AdminBookingsPage() {
    return (
        <Suspense fallback={<div className="text-white p-8">Loading...</div>}>
            <AdminBookingsContent />
        </Suspense>
    );
}
