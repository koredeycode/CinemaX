"use client";

import { IMovie } from "@/models/Movie";
import { useCartStore } from "@/store/cartStore";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import io, { Socket } from "socket.io-client"; // Socket removed for refactor simplicity, can re-add later if needed

interface SeatMapProps {
  movie: IMovie;
  date: string;
  time: string;
  userId?: string; 
}

// let socket: Socket;

export default function SeatMap({ movie, date, time, userId }: SeatMapProps) {
  const router = useRouter();
  const { currentSession, startSession, updateSeats } = useCartStore();
  
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  // const [lockedSeats, setLockedSeats] = useState<{ [key: string]: string }>({});
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded for now, or could come from Movie model if dynamic per movie
  const rows = 10;
  const cols = 12;

  const [guestId, setGuestId] = useState<string>("");

  useEffect(() => {
    if (!userId) {
        let stored = localStorage.getItem("guest_id");
        if (!stored) {
            stored = `guest_${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem("guest_id", stored);
        }
        setGuestId(stored);
    }
  }, [userId]);

  // Fetch Availability
  useEffect(() => {
      if(movie && date && time) {
          fetch(`/api/bookings/availability?movieId=${movie._id}&date=${date}&time=${time}`)
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    setBookedSeats(data.bookedSeats);
                }
            })
            .catch(err => console.error("Failed to load seats", err));
      }
  }, [movie, date, time]);

  // Sync with Global Session State
  useEffect(() => {
    // Check if session matches
    if (currentSession?.movieId === movie._id.toString() && currentSession?.date === date && currentSession?.time === time) {
        setSelectedSeats(currentSession.seats);
    } else {
        // Start new session
        startSession(
            movie,
            date,
            time,
            movie.price || 4500 // Default price fallback
        );
    }
  }, [movie._id, date, time]); // Check dependencies carefully

  const handleSeatClick = (row: number, col: number) => {
    const seatLabel = `${String.fromCharCode(65 + row)}${col + 1}`;
    
    if (bookedSeats.includes(seatLabel)) return;

    // Toggle selection
    let newSelection = [...selectedSeats];
    if (selectedSeats.includes(seatLabel)) {
        newSelection = newSelection.filter(s => s !== seatLabel);
    } else {
        newSelection.push(seatLabel);
    }
    
    setSelectedSeats(newSelection);
    updateSeats(newSelection);
  };

  const handleConfirm = () => {
    updateSeats(selectedSeats);
    // Passing params in URL not really needed if store has it, but good for linking?
    // Actually we just need to go to food. State is in store.
    router.push(`/booking/food`);
  };

  const halfCols = Math.ceil(cols / 2);

  return (
    <div className="w-full max-w-5xl mx-auto md:p-8 p-4 rounded-xl min-h-[600px] flex flex-col items-center">
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-center text-sm w-full max-w-md">
            {error}
        </div>
      )}

      {/* Screen - SVG Curve */}
      <div className="w-full max-w-2xl mb-12 relative flex flex-col items-center px-4">
        <svg 
            viewBox="0 0 100 12" 
            className="w-full h-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] opacity-80"
            preserveAspectRatio="none"
        >
            <path d="M0,12 Q50,0 100,12" fill="none" stroke="#6b7280" strokeWidth="2" />
        </svg>
        <div className="text-gray-600 text-[10px] uppercase tracking-[0.5em] mt-2 text-center w-full">Screen</div>
      </div>

      {/* Main Seat Grid Container - Horizontal Scroll for Mobile */}
      <div className="w-full overflow-x-auto pb-12 flex justify-center">
        <div className="flex gap-4 items-start min-w-max px-4">
            {/* Row Labels (Left Side) */}
            <div className="flex flex-col gap-3 pt-1 sticky left-0 z-10 bg-[#111] pr-2">
                {Array.from({ length: rows }).map((_, r) => {
                    const isAisleAfter = r === 3;
                    return (
                        <div 
                            key={r} 
                            className={clsx(
                                "h-8 flex items-center justify-center text-gray-500 text-xs w-6 font-bold",
                                isAisleAfter && "mb-10"
                            )}
                        >
                            {String.fromCharCode(65 + r)} 
                        </div>
                    );
                })}
            </div>

            {/* Seats */}
            <div className="flex flex-col gap-3">
                {Array.from({ length: rows }).map((_, r) => {
                    const isAisleAfter = r === 3;
                    
                    return (
                        <div 
                            key={r} 
                            className={clsx(
                                "flex gap-3 justify-center",
                                isAisleAfter && "mb-10"
                            )}
                        >
                            {Array.from({ length: cols }).map((_, c) => {
                                const seatLabel = `${String.fromCharCode(65 + r)}${c + 1}`;
                                const isBooked = bookedSeats.includes(seatLabel);
                                const isSelected = selectedSeats.includes(seatLabel);
                                const isMiddleGap = c === halfCols - 1;

                                let statusColor = "bg-[#3A3A45] hover:bg-[#4A4A55] text-gray-300"; // Available
                                let bottomBorder = "border-b-4 border-[#25252E]";

                                if (isBooked) {
                                    statusColor = "bg-[#5c0000] text-red-200/50 cursor-not-allowed";
                                    bottomBorder = "border-b-4 border-[#3a0000]";
                                } else if (isSelected) {
                                    statusColor = "bg-[#e50914] shadow-[0_0_15px_rgba(229,9,20,0.6)] text-white";
                                    bottomBorder = "border-b-4 border-[#b00710]";
                                }

                                return (
                                    <div key={seatLabel} className={clsx("flex", isMiddleGap && "mr-10")}>
                                        <button
                                            onClick={() => handleSeatClick(r, c)}
                                            disabled={isBooked}
                                            className={clsx(
                                                "w-9 h-8 rounded-t-lg rounded-b-md text-[10px] font-medium flex items-center justify-center transition-all duration-200 relative group",
                                                statusColor,
                                                bottomBorder
                                            )}
                                            title={seatLabel}
                                        >
                                            {c + 1}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-400">
        <div className="flex items-center gap-2">
             <div className="w-5 h-5 bg-[#3A3A45] rounded-t-md border-b-4 border-[#25252E]"></div>
            <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#e50914] rounded-t-md border-b-4 border-[#b00710] shadow-[0_0_10px_rgba(229,9,20,0.5)]"></div>
            <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#5c0000] rounded-t-md border-b-4 border-[#3a0000]"></div>
            <span>Booked</span>
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 p-6 z-50">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 justify-between items-center">
                <div className="text-center md:text-left">
                    <p className="text-gray-400 text-sm mb-1">Selected Seats ({selectedSeats.length})</p>
                    <p className="text-xl font-bold text-white break-words animate-in fade-in slide-in-from-bottom-2">
                        {selectedSeats.join(", ")}
                    </p>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="text-center md:text-right hidden md:block">
                        <p className="text-gray-400 text-sm mb-1">Total</p>
                        <p className="text-3xl font-bold text-[#e50914]">₦{((movie.price || 4500) * selectedSeats.length).toLocaleString()}</p>
                    </div>
                    <button 
                        onClick={handleConfirm}
                        className="bg-[#e50914] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#b00710] transition-colors shadow-lg shadow-[#e50914]/25 whitespace-nowrap"
                    >
                        Continue Booking
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
