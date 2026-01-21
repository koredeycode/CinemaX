"use client";

import SeatMap from "@/components/SeatMap";
import { EmptyState } from "@/components/ui/EmptyState";
import { IShowtime } from "@/models/Showtime";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SeatSelectionPage() {
  const params = useParams();
  const showtimeId = params?.showtimeId as string;
  const [showtime, setShowtime] = useState<IShowtime | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!showtimeId) return;

    fetch(`/api/showtimes/${showtimeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setShowtime(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [showtimeId]);

  if (loading) {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="h-8 w-64 mx-auto bg-gray-800 rounded mb-2 animate-pulse"></div>
            <div className="h-4 w-48 mx-auto bg-gray-800 rounded mb-8 animate-pulse"></div>
            
            <div className="w-full max-w-5xl mx-auto p-6 bg-gray-900/50 rounded-xl border border-gray-800 animate-pulse min-h-[500px] flex flex-col items-center">
                {/* Curved Screen Skeleton */}
                <div className="w-full max-w-2xl h-12 mb-10 relative">
                    <div className="absolute top-0 left-0 w-full h-full border-t-4 border-gray-700 rounded-[50%] opacity-50"></div>
                </div>
                
                {/* Seat Grid Skeleton */}
                <div className="flex gap-4">
                     {/* Row Labels Skeleton */}
                     <div className="flex flex-col gap-3 pt-1">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className={`w-4 h-8 bg-gray-800 rounded ${i === 3 ? 'mb-10' : ''}`}></div>
                        ))}
                     </div>

                     {/* Seats Skeleton - Split into two blocks for visual realism */}
                     <div className="flex gap-8">
                        <div className="grid grid-cols-4 gap-3">
                            {Array.from({ length: 32 }).map((_, i) => (
                                <div key={i} className={`w-9 h-8 bg-gray-800 rounded-lg ${i >= 12 && i < 16 ? 'mb-10' : ''}`}></div>
                            ))}
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                             {Array.from({ length: 32 }).map((_, i) => (
                                <div key={i} className={`w-9 h-8 bg-gray-800 rounded-lg ${i >= 12 && i < 16 ? 'mb-10' : ''}`}></div>
                            ))}
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
  }

  if (!showtime) {
    return (
        <div className="container mx-auto px-4 py-20">
             <EmptyState 
                title="Showtime Not Found" 
                message="The showtime you are looking for does not exist or has been removed."
                actionLabel="Back to Movies"
                actionLink="/"
             />
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2 text-center">Select Seats</h1>
      <p className="text-gray-400 text-center mb-8">
        {(showtime.movie as any).title} - {new Date(showtime.startTime).toLocaleString()}
      </p>
      <SeatMap showtime={showtime} />
    </div>
  );
}
