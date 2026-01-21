"use client";

import { IShowtime } from "@/models/Showtime";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";

interface ShowtimeSelectorProps {
  showtimes: IShowtime[];
}

export default function ShowtimeSelector({ showtimes }: ShowtimeSelectorProps) {
  // Default to first showtime if available
  const [activeShowtime, setActiveShowtime] = useState<IShowtime | null>(showtimes.length > 0 ? showtimes[0] : null);

  if (showtimes.length === 0) {
    return (
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 text-center text-gray-500">
            No showtimes available.
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex gap-3 flex-wrap pb-4">
            {showtimes.map(st => (
                <button 
                    key={(st._id as unknown) as string}
                    onClick={() => setActiveShowtime(st)}
                    className={clsx(
                        "px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all duration-200 border transform hover:scale-105 hover:shadow-lg",
                        activeShowtime?._id === st._id 
                            ? "bg-primary border-primary text-white scale-105 shadow-lg shadow-primary/20" 
                            : "bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white"
                    )}
                >
                    {new Date(st.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </button>
            ))}
        </div>
        
        <div className="mt-8">
             <Link
                href={activeShowtime ? `/booking/${activeShowtime._id}` : "#"}
                className={clsx(
                    "block w-full bg-primary text-white text-center py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-colors",
                    !activeShowtime && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
             >
                 Book Tickets
             </Link>
        </div>
    </div>
  );
}
