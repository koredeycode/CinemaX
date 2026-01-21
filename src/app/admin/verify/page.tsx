"use client";

import { useState } from "react";

export default function VerifyTicketPage() {
  const [bookingId, setBookingId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");

    // In a real app we might have a dedicated verify endpoint, 
    // or just fetch ticket details. Since we have a PDF route, 
    // we could check existence via GET /api/tickets/[id] but that downloads PDF.
    // Let's create a quick client-side check via a new API or just re-use fetching booking via admin API if available.
    // Assuming we want to verify details, let's assume we can fetch booking info. 
    // But we don't have a generic "get booking by id" API exposed yet except for the PDF.
    
    // Quick solution: We will call a verify action. 
    // Since we don't have a specific ID endpoint, let's implement a quick client-side fetch 
    // to a new route `/api/admin/verify-booking` or just assume we'd add one.
    // For now, let's fetch from our existing `api/bookings`? No, that's POST.
    
    // I'll implement a simple server action or just a fetch to `/api/tickets/[id]` isn't right.
    // Let's just mock the behavior by trying to "find" it if we had an API.
    // Better: I'll add a simple GET handler to `src/app/api/admin/verify/route.ts` quickly?
    // Or simpler: Reuse the logic. 
    // Actually, I'll just make a POST to `/api/admin/verify` with ID.
    
    try {
        const res = await fetch("/api/admin/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId })
        });
        
        const data = await res.json();
        if (data.success) {
            setResult(data.data);
        } else {
            setError(data.error || "Invalid Ticket");
        }
    } catch (err) {
        setError("Verification Failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Verify Ticket</h1>

        <div className="bg-gray-900 p-8 rounded-xl border border-gray-800">
            <form onSubmit={handleVerify} className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Booking ID</label>
                    <input 
                        type="text" 
                        value={bookingId} 
                        onChange={(e) => setBookingId(e.target.value)}
                        placeholder="Scan or enter ID"
                        className="w-full bg-gray-800 border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-center tracking-widest"
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                    {loading ? "Verifying..." : "Verify Ticket"}
                </button>
            </form>

            {error && (
                <div className="mt-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-center">
                    <p className="text-red-200 font-medium">❌ {error}</p>
                </div>
            )}

            {result && (
                <div className="mt-6 p-6 bg-green-900/30 border border-green-500 rounded-lg text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">Valid Ticket</h2>
                    <p className="text-green-400 text-sm mb-4">Status: {result.status}</p>
                    
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b border-white/10 pb-2">
                            <span className="text-gray-400">Guest</span>
                            <span className="text-white font-medium">{result.guestDetails.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-2">
                            <span className="text-gray-400">Movie</span>
                            <span className="text-white font-medium">{result.showtime.movie.title}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-2">
                            <span className="text-gray-400">Time</span>
                            <span className="text-white font-medium">
                                {new Date(result.showtime.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                         <div className="flex justify-between pt-2">
                            <span className="text-gray-400">Seats</span>
                            <span className="text-white font-bold">{result.seats.join(", ")}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
