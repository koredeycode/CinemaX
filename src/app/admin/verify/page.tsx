"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyPage() {
  const [refId, setRefId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If query param 'ref' is present (from QR scan), auto-verify
  const searchParams = useSearchParams();
  const refFromQuery = searchParams.get("ref");

  useEffect(() => {
      if (refFromQuery) {
          setRefId(refFromQuery);
          verifyTicket(refFromQuery);
      }
  }, [refFromQuery]);

  const verifyTicket = async (idToVerify: string) => {
      setLoading(true);
      setError("");
      setResult(null);

      try {
        const res = await fetch("/api/admin/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refId: idToVerify })
        });
        
        const data = await res.json();
        if (data.success) {
            setResult(data.data);
        } else {
            setError(data.error);
        }
      } catch (err) {
          setError("Verification failed");
      } finally {
          setLoading(false);
      }
  };

  const handleManualVerify = (e: React.FormEvent) => {
      e.preventDefault();
      verifyTicket(refId);
  };

  return (
    <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Verify Ticket</h1>

        <div className="bg-gray-900 p-8 rounded-xl border border-gray-800">
            <form onSubmit={handleManualVerify} className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Reference ID</label>
                    <input 
                        type="text" 
                        value={refId} 
                        onChange={(e) => setRefId(e.target.value)}
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
                            <span className="text-white font-medium">{result.guestDetails?.name || "Guest"}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-2">
                            <span className="text-gray-400">Movie</span>
                            <span className="text-white font-medium">{result.movieId?.title || "Unknown"}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-2">
                            <span className="text-gray-400">Date</span>
                            <span className="text-white font-medium">
                                {result.date ? new Date(result.date).toLocaleDateString() : result.date}
                            </span>
                        </div>
                         <div className="flex justify-between border-b border-white/10 pb-2">
                            <span className="text-gray-400">Time</span>
                            <span className="text-white font-medium">
                                {result.time}
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
