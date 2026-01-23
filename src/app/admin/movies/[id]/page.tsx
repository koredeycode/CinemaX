"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

interface ScheduleItem {
  date: string;
  times: string[];
}

export default function EditMoviePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    posterUrl: "",
    trailerUrl: "",
    rating: "PG-13",
    runtime: 120,
    genres: "",
    price: 4500,
    schedule: [] as ScheduleItem[]
  });

  useEffect(() => {
    fetch(`/api/movies/${id}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const movie = data.data;
                setFormData({
                    title: movie.title,
                    description: movie.description,
                    posterUrl: movie.posterUrl,
                    trailerUrl: movie.trailerUrl,
                    rating: movie.rating,
                    runtime: movie.runtime,
                    genres: movie.genres.join(", "),
                    price: movie.price || 4500,
                    schedule: movie.schedule || []
                });
            } else {
                setError("Failed to load movie");
            }
        })
        .catch(() => setError("Error loading movie"))
        .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Schedule Management Handlers
  const addDate = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { date: "", times: [] }]
    }));
  };

  const removeDate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const updateDate = (index: number, date: string) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index].date = date;
    setFormData({ ...formData, schedule: newSchedule });
  };

  const addTime = (dateIndex: number) => {
    const newSchedule = [...formData.schedule];
    newSchedule[dateIndex].times.push("12:00");
    setFormData({ ...formData, schedule: newSchedule });
  };

  const updateTime = (dateIndex: number, timeIndex: number, time: string) => {
    const newSchedule = [...formData.schedule];
    newSchedule[dateIndex].times[timeIndex] = time;
    setFormData({ ...formData, schedule: newSchedule });
  };

  const removeTime = (dateIndex: number, timeIndex: number) => {
    const newSchedule = [...formData.schedule];
    newSchedule[dateIndex].times = newSchedule[dateIndex].times.filter((_, i) => i !== timeIndex);
    setFormData({ ...formData, schedule: newSchedule });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        const payload = {
            ...formData,
            genres: formData.genres.split(",").map(g => g.trim()),
            runtime: Number(formData.runtime),
            price: Number(formData.price)
        };

        const res = await fetch(`/api/movies/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            router.push("/admin/movies");
            router.refresh();
        } else {
            const data = await res.json();
            setError(data.error || "Failed to update movie");
        }
    } catch (err) {
        setError("An error occurred");
    } finally {
        setLoading(false);
    }
  };

  if (fetching) {
    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-pulse">
            <div className="h-10 w-48 bg-gray-800 rounded mb-8"></div>
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-6">
                <div className="space-y-2">
                    <div className="h-4 w-16 bg-gray-800 rounded"></div>
                    <div className="h-10 w-full bg-gray-800 rounded"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-800 rounded"></div>
                    <div className="h-32 w-full bg-gray-800 rounded"></div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-10">
        <h1 className="text-3xl font-bold text-white mb-8">Edit Movie</h1>

        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-6">
            {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900">{error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                    <input name="title" required value={formData.title} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Price (₦)</label>
                    <input type="number" name="price" required value={formData.price} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea name="description" required value={formData.description} onChange={handleChange} rows={4} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Rating</label>
                    <select name="rating" value={formData.rating} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                        <option value="G">G</option>
                        <option value="PG">PG</option>
                        <option value="PG-13">PG-13</option>
                        <option value="R">R</option>
                        <option value="NC-17">NC-17</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Runtime (mins)</label>
                    <input type="number" name="runtime" required value={formData.runtime} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1">Genres (comma separated)</label>
                <input name="genres" placeholder="Action, Adventure, Sci-Fi" required value={formData.genres} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1">Poster URL</label>
                <input name="posterUrl" required value={formData.posterUrl} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1">Trailer URL (YouTube)</label>
                <input name="trailerUrl" required value={formData.trailerUrl} onChange={handleChange} className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
            </div>

            {/* Schedule Section */}
            <div className="pt-4 border-t border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Showtimes</h2>
                    <button 
                        type="button" 
                        onClick={addDate}
                        className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                        + Add Date
                    </button>
                </div>
                
                <div className="space-y-4">
                    {formData.schedule.map((item, dateIndex) => (
                        <div key={dateIndex} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 mr-4">
                                    <label className="block text-xs text-gray-400 mb-1">Date (YYYY-MM-DD)</label>
                                    <input 
                                        type="date" 
                                        value={item.date} 
                                        onChange={(e) => updateDate(dateIndex, e.target.value)}
                                        className="bg-gray-800 border-gray-600 rounded px-3 py-1 text-white text-sm w-full"
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => removeDate(dateIndex)}
                                    className="text-red-400 hover:text-red-300 text-sm mt-5"
                                >
                                    Remove
                                </button>
                            </div>
                            
                            <div>
                                <label className="block text-xs text-gray-400 mb-2">Times</label>
                                <div className="flex flex-wrap gap-2">
                                    {item.times.map((time, timeIndex) => (
                                        <div key={timeIndex} className="flex items-center bg-gray-900 rounded px-2 py-1 border border-gray-700">
                                            <input 
                                                type="time" 
                                                value={time}
                                                onChange={(e) => updateTime(dateIndex, timeIndex, e.target.value)}
                                                className="bg-transparent text-white text-sm outline-none w-20"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => removeTime(dateIndex, timeIndex)}
                                                className="ml-1 text-gray-500 hover:text-red-400"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    <button 
                                        type="button" 
                                        onClick={() => addTime(dateIndex)}
                                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                    >
                                        + Time
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {formData.schedule.length === 0 && (
                        <div className="text-gray-500 text-center py-4 bg-gray-800/30 rounded-lg text-sm">
                            No showtimes scheduled. Click "Add Date" to start.
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                    {loading ? "Updating..." : "Update Movie"}
                </button>
            </div>
        </form>
    </div>
  );
}
