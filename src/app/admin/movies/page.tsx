"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { IMovie } from "@/models/Movie";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`/api/movies?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMovies(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch movies", error);
      toast.error("Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchMovies();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const updateStatus = async (id: string, newStatus: string) => {
    const originalMovies = [...movies];
    // Optimistic update
    setMovies((prev) =>
      prev.map((m) =>
        (m as any)._id === id ? { ...m, status: newStatus } : m
      ) as IMovie[]
    );

    try {
      const res = await fetch(`/api/movies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error);
      }
      toast.success("Movie status updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
      setMovies(originalMovies); // Revert
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Manage Movies</h1>
        
        <div className="flex gap-4 w-full md:w-auto">
            <input 
                type="text" 
                placeholder="Search movies..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-2 w-full md:w-64 focus:outline-none focus:border-primary"
            />
            <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
            >
                <option value="">All Statuses</option>
                <option value="now_showing">Now Showing</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="not_showing">Not Showing</option>
            </select>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-gray-950 text-gray-400 font-medium uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Movie</th>
              <th className="px-6 py-4">Release Year</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="w-10 h-14" />
                                <div className="space-y-2">
                                    <Skeleton className="w-32 h-4" />
                                    <Skeleton className="w-20 h-3" />
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4"><Skeleton className="w-16 h-4" /></td>
                        <td className="px-6 py-4"><Skeleton className="w-8 h-6" /></td>
                        <td className="px-6 py-4"><Skeleton className="w-24 h-8" /></td>
                        <td className="px-6 py-4"><Skeleton className="w-12 h-4" /></td>
                    </tr>
                 ))
            ) : (
                movies.map((movie) => (
                <tr key={(movie as any)._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-14 bg-gray-800 rounded overflow-hidden shrink-0 relative">
                            {movie.posterUrl && <img src={movie.posterUrl} className="w-full h-full object-cover" alt="" />}
                        </div>
                        <div>
                            <div className="font-bold text-white">{movie.title}</div>
                            <div className="text-xs text-gray-500">{movie.genres.join(", ")}</div>
                        </div>
                    </div>
                    </td>
                    <td className="px-6 py-4">
                        {new Date(movie.createdAt).getFullYear()}
                    </td>
                    <td className="px-6 py-4">
                        <span className="bg-gray-800 px-2 py-1 rounded text-xs border border-gray-700">
                            {movie.rating}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                    <select
                        value={movie.status}
                        onChange={(e) => updateStatus((movie as any)._id, e.target.value)}
                        className={`bg-transparent border border-gray-700 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 outline-none ${
                            movie.status === 'now_showing' ? 'text-green-400 border-green-900 bg-green-900/10' :
                            movie.status === 'coming_soon' ? 'text-blue-400 border-blue-900 bg-blue-900/10' :
                            'text-gray-500'
                        }`}
                    >
                        <option value="now_showing" className="bg-gray-900 text-green-400">Now Showing</option>
                        <option value="coming_soon" className="bg-gray-900 text-blue-400">Coming Soon</option>
                        <option value="not_showing" className="bg-gray-900 text-gray-400">Not Showing</option>
                    </select>
                    </td>
                    <td className="px-6 py-4">
                    <Link 
                        href={`/admin/movies/${(movie as any)._id}`}
                        className="text-primary hover:text-white transition-colors text-sm font-medium"
                    >
                        Edit
                    </Link>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
