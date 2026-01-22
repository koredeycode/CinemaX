"use client";

import { IShowtime } from "@/models/Showtime";
import { useCartStore } from "@/store/cartStore";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

interface SeatMapProps {
  showtime: IShowtime;
  // In a real app we'd pass user ID here, or get it from context
  userId?: string; 
}

let socket: Socket;

export default function SeatMap({ showtime, userId }: SeatMapProps) {
  const router = useRouter();
  const { currentSession, startSession, updateSeats } = useCartStore();
  
  const [lockedSeats, setLockedSeats] = useState<{ [key: string]: string }>({});
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const rows = showtime.seatMap.rows;
  const cols = showtime.seatMap.cols;
  const bookedSeats = showtime.bookedSeats;

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

  const activeUser = userId || guestId;

  // Sync with Global Session State
  useEffect(() => {
    // If we have an active session for THIS showtime, load the selected seats
    if (currentSession?.showtimeId === showtime._id.toString()) {
        setSelectedSeats(currentSession.seats);
    } else {
        // Otherwise, start a fresh session (or overwrite if it was a diff showtime)
        // We do this to ensure we are working on the correct data
        startSession(
            showtime.movie as any,
            showtime._id.toString(),
            showtime.startTime.toString(),
            showtime.price
        );
    }
  }, [showtime._id, currentSession?.showtimeId]); // Intentionally simplified deps to simple start/check

  useEffect(() => {
    // Connect to custom server socket path
    socket = io({
      path: "/api/socket/io",
    });

    socket.on("connect", () => {
      socket.emit("join-showtime", String(showtime._id));
    });

    socket.on("seat-locked", ({ seatLabel, userId: lockerId }: { seatLabel: string, userId: string }) => {
      setLockedSeats((prev) => ({ ...prev, [seatLabel]: lockerId }));
    });

    socket.on("seat-released", ({ seatLabel }: { seatLabel: string }) => {
      setLockedSeats((prev) => {
        const next = { ...prev };
        delete next[seatLabel];
        return next;
      });
    });

    socket.on("seat-error", ({ message }: { message: string }) => {
        setError(message);
        setTimeout(() => setError(null), 3000);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [showtime._id]);

  const handleSeatClick = (row: number, col: number) => {
    const seatLabel = `${String.fromCharCode(65 + row)}${col + 1}`;
    
    // If already booked
    if (bookedSeats.includes(seatLabel)) return;

    // If locked by someone else
    if (lockedSeats[seatLabel] && lockedSeats[seatLabel] !== activeUser) return;

    // Toggle selection
    let newSelection = [...selectedSeats];
    if (selectedSeats.includes(seatLabel)) {
        // Deselect
        newSelection = newSelection.filter(s => s !== seatLabel);
        socket.emit("release-seat", { showtimeId: showtime._id, seatLabel });
    } else {
        // Select
        newSelection.push(seatLabel);
        socket.emit("select-seat", { showtimeId: showtime._id, seatLabel, userId: activeUser });
    }
    
    // Update local and global store immediately for responsiveness or on unmount
    // But typically we update on Confirm. However, for "Auto-load" feature, 
    // it's nice to keep store in sync. Let's start with local state and sync on confirm for now
    // to avoid excessive re-renders or side effects, OR sync on change if we want persistence even before confirm.
    // The requirement says "auto load the selection... if available", implying persistence.
    // So let's sync constantly.
    setSelectedSeats(newSelection);
    updateSeats(newSelection);
  };

  const handleConfirm = () => {
    // Final sync just in case
    updateSeats(selectedSeats);
    router.push(`/booking/${showtime._id}/food`);
  };

  // Helper to split columns for the aisle
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
            {/* Row Labels (Left Side) - MOVED HERE */}
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
                    // Determine if we need a large gap after this row (horizontal aisle)
                    // For example, split after row index 3 (Row 4)
                    const isAisleAfter = r === 3;
                    
                    return (
                        <div 
                            key={r} 
                            className={clsx(
                                "flex gap-3 justify-center",
                                isAisleAfter && "mb-10" // Horizontal Aisle
                            )}
                        >
                            {Array.from({ length: cols }).map((_, c) => {
                                const seatLabel = `${String.fromCharCode(65 + r)}${c + 1}`;
                                const isBooked = bookedSeats.includes(seatLabel);
                                const isLocked = !!lockedSeats[seatLabel] && lockedSeats[seatLabel] !== activeUser;
                                const isSelected = selectedSeats.includes(seatLabel);
                                const isMyLock = lockedSeats[seatLabel] === activeUser;

                                // Split logic: add extra margin to the right of the middle column
                                const isMiddleGap = c === halfCols - 1;

                                let statusColor = "bg-[#3A3A45] hover:bg-[#4A4A55] text-gray-300"; // Available (Solid Dark Grey/Blue)
                                let bottomBorder = "border-b-4 border-[#25252E]"; // 3D Effect for available

                                if (isBooked) {
                                    statusColor = "bg-[#5c0000] text-red-200/50 cursor-not-allowed"; // Booked (Solid Dark Red)
                                    bottomBorder = "border-b-4 border-[#3a0000]"; // Darker depth for booked
                                } else if (isLocked) {
                                    statusColor = "bg-yellow-600 cursor-not-allowed";
                                    bottomBorder = "border-b-4 border-yellow-800";
                                } else if (isSelected || isMyLock) {
                                    statusColor = "bg-[#e50914] shadow-[0_0_15px_rgba(229,9,20,0.6)] text-white"; // Selected (Bright Red)
                                    bottomBorder = "border-b-4 border-[#b00710]"; // Depth for selected
                                }

                                return (
                                    <div key={seatLabel} className={clsx("flex", isMiddleGap && "mr-10")}>
                                        <button
                                            onClick={() => handleSeatClick(r, c)}
                                            disabled={isBooked || (isLocked && !isMyLock)}
                                            className={clsx(
                                                "w-9 h-8 rounded-t-lg rounded-b-md text-[10px] font-medium flex items-center justify-center transition-all duration-200 relative group",
                                                statusColor,
                                                bottomBorder
                                            )}
                                            title={seatLabel}
                                        >
                                            {/* Show Column Number, e.g. 1, 2, 3 */}
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
         <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-yellow-600 rounded-t-md border-b-4 border-yellow-800"></div>
            <span>Locked</span>
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
                        <p className="text-3xl font-bold text-[#e50914]">₦{(showtime.price * selectedSeats.length).toLocaleString()}</p>
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
