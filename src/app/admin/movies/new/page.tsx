"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewMoviePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    posterUrl: "",
    trailerUrl: "",
    rating: "PG-13",
    runtime: 120,
    genres: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        const payload = {
            ...formData,
            genres: formData.genres.split(",").map(g => g.trim()),
            runtime: Number(formData.runtime)
        };

        const res = await fetch("/api/movies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            router.push("/admin/movies");
            router.refresh();
        } else {
            const data = await res.json();
            setError(data.error || "Failed to create movie");
        }
    } catch (err) {
        setError("An error occurred");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Add New Movie</h1>

        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-6">
            {error && <div className="text-red-400 text-sm">{error}</div>}
            
            <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input name="title" required value={formData.title} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white" />
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea name="description" required value={formData.description} onChange={handleChange} rows={4} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white" />
            </div>

            <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Rating</label>
                    <select name="rating" value={formData.rating} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white">
                        <option value="G">G</option>
                        <option value="PG">PG</option>
                        <option value="PG-13">PG-13</option>
                        <option value="R">R</option>
                        <option value="NC-17">NC-17</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Runtime (mins)</label>
                    <input type="number" name="runtime" required value={formData.runtime} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white" />
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1">Genres (comma separated)</label>
                <input name="genres" placeholder="Action, Adventure, Sci-Fi" required value={formData.genres} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white" />
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1">Poster URL</label>
                <input name="posterUrl" required value={formData.posterUrl} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white" />
            </div>

             <div>
                <label className="block text-sm text-gray-400 mb-1">Trailer URL (YouTube)</label>
                <input name="trailerUrl" required value={formData.trailerUrl} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white" />
            </div>

            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Movie"}
                </button>
            </div>
        </form>
    </div>
  );
}
