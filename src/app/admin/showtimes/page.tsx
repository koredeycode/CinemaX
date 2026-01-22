"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { IMovie } from "@/models/Movie";
import { IShowtime } from "@/models/Showtime";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminShowtimesPage() {
    const [showtimes, setShowtimes] = useState<IShowtime[]>([]);
    const [movies, setMovies] = useState<IMovie[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [movieId, setMovieId] = useState("");
    const [date, setDate] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Showtimes
            const showtimeParams = new URLSearchParams();
            if (movieId) showtimeParams.append("movieId", movieId);
            if (date) showtimeParams.append("date", date);
            
            const resShowtimes = await fetch(`/api/showtimes?${showtimeParams.toString()}`);
            const dataShowtimes = await resShowtimes.json();

            if (dataShowtimes.success) {
                setShowtimes(dataShowtimes.data);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to fetch showtimes");
        } finally {
            setLoading(false);
        }
    };

    const fetchMovies = async () => {
        try {
            const res = await fetch("/api/movies");
            const data = await res.json();
            if (data.success) setMovies(data.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    useEffect(() => {
        fetchData();
    }, [movieId, date]);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-white">Showtimes</h1>
                <Link 
                    href="/admin/showtimes/new" 
                    className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
                >
                    Add Showtime
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1 uppercase font-bold">Filter by Movie</label>
                    <select
                        value={movieId}
                        onChange={(e) => setMovieId(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    >
                        <option value="">All Movies</option>
                        {movies.map(movie => (
                            <option key={(movie as any)._id} value={(movie as any)._id}>{movie.title}</option>
                        ))}
                    </select>
                </div>
                 <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1 uppercase font-bold">Filter by Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    />
                </div>
                 <div className="flex items-end">
                    <button 
                        onClick={() => { setMovieId(""); setDate(""); }}
                        className="text-sm text-primary hover:text-white px-4 py-2"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-800 text-white uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Movie</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Booked</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                         {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <Skeleton className="w-8 h-8 rounded" />
                                        <Skeleton className="w-32 h-4" />
                                    </td>
                                    <td className="px-6 py-4"><Skeleton className="w-24 h-4" /></td>
                                    <td className="px-6 py-4"><Skeleton className="w-16 h-4" /></td>
                                    <td className="px-6 py-4"><Skeleton className="w-12 h-4" /></td>
                                    <td className="px-6 py-4"><Skeleton className="w-20 h-4" /></td>
                                </tr>
                            ))
                        ) : showtimes.length > 0 ? (
                            showtimes.map((st) => (
                                <tr key={String(st._id)} className="hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                                         {/* Assuming movie is populated */}
                                        {(st.movie as unknown as IMovie)?.title || "Unknown Movie"}
                                    </td>
                                    <td className="px-6 py-4">{new Date(st.startTime).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{new Date(st.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                    <td className="px-6 py-4">₦{st.price}</td>
                                    <td className="px-6 py-4">{st.bookedSeats.length} seats</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No showtimes found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
