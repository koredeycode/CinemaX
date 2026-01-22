"use client";

import { IMovie } from "@/models/Movie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewShowtimePage() {
  const router = useRouter();
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    movieId: "",
    date: "",
    time: "",
    price: 15,
  });

  useEffect(() => {
    fetch("/api/movies")
        .then(res => res.json())
        .then(data => {
            if (data.success) setMovies(data.data);
        });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        // Construct startTime ISO string from date and time
        const startDateTime = new Date(`${formData.date}T${formData.time}`);
        
        const payload = {
            movie: formData.movieId,
            startTime: startDateTime.toISOString(),
            price: Number(formData.price),
            // theaterId/seatMap are defaults for now as per schema logic or backend default
        };

        const res = await fetch("/api/showtimes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            router.push("/admin/showtimes");
            router.refresh();
        } else {
            const data = await res.json();
            setError(data.error || "Failed to create showtime");
        }
    } catch (err) {
        setError("An error occurred");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Add New Showtime</h1>

        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-6">
            {error && <div className="text-red-400 text-sm">{error}</div>}
            
            <div>
                <label className="block text-sm text-gray-400 mb-1">Movie</label>
                <select name="movieId" required value={formData.movieId} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white">
                    <option value="">Select a movie...</option>
                    {movies.map(movie => (
                        <option key={(movie._id as any).toString()} value={(movie._id as any).toString()}>
                            {movie.title}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Date</label>
                    <input type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white" />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Time</label>
                    <input type="time" name="time" required value={formData.time} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white" />
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1">Price (₦)</label>
                <input type="number" name="price" required value={formData.price} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white" />
            </div>

            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Showtime"}
                </button>
            </div>
        </form>
    </div>
  );
}
