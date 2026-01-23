"use client";

import { IMovie } from "@/models/Movie";
import { useCartStore } from "@/store/cartStore";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { toast } from "sonner";

interface SeatMapProps {
  movie: IMovie;
  date: string;
  time: string;
  userId?: string; 
}

export default function SeatMap({ movie, date, time, userId }: SeatMapProps) {
  const router = useRouter();
  const { currentSession, startSession, updateSeats } = useCartStore();
  
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [lockedSeats, setLockedSeats] = useState<{ [key: string]: string }>({}); // seat -> userId
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const showtimeId = `${movie._id}:${date}:${time}`;

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

  // WebSocket Connection
  useEffect(() => {
    // Initialize Socket
    socketRef.current = io({
        path: "/api/socket/io",
        addTrailingSlash: false,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
        console.log("Connected to socket server");
        socket.emit("join-showtime", showtimeId);
    });

    socket.on("seat-locked", ({ seatLabel, userId: lockerId }: { seatLabel: string, userId: string }) => {
        console.log(`[SeatMap] Seat locked event: ${seatLabel} by ${lockerId}`);
        setLockedSeats(prev => ({ ...prev, [seatLabel]: lockerId }));
    });

    socket.on("seat-released", ({ seatLabel }: { seatLabel: string }) => {
        console.log(`[SeatMap] Seat released event: ${seatLabel}`);
        setLockedSeats(prev => {
            const newLocked = { ...prev };
            delete newLocked[seatLabel];
            return newLocked;
        });
    });

    socket.on("seat-error", ({ message }: { message: string }) => {
        toast.error(message);
        // Revert selection if needed (though we check before selecting)
    });

    return () => {
        if (socket) socket.disconnect();
    };
  }, [showtimeId]);


  // Timer Logic
  useEffect(() => {
      if (selectedSeats.length > 0 && timeLeft === null) {
          // Start timer if not running
          setTimeLeft(300); // 5 minutes
      } else if (selectedSeats.length === 0) {
          // Stop timer if no seats
          setTimeLeft(null);
          if (timerRef.current) clearInterval(timerRef.current);
      }
  }, [selectedSeats.length, timeLeft]);

  useEffect(() => {
      if (timeLeft !== null && timeLeft > 0) {
          timerRef.current = setInterval(() => {
              setTimeLeft(prev => {
                  if (prev && prev > 1) return prev - 1;
                  return 0;
              });
          }, 1000);
      } else if (timeLeft === 0) {
          // Time expired!
          if (timerRef.current) clearInterval(timerRef.current);
          handleExpiry();
      }

      return () => {
          if (timerRef.current) clearInterval(timerRef.current);
      };
  }, [timeLeft]);

  const handleExpiry = () => {
      toast.warning("Seat reservation expired! Please try again.");
      
      // Release all selected seats
      selectedSeats.forEach(seat => {
          socketRef.current?.emit("release-seat", {
              showtimeId,
              seatLabel: seat
          });
      });
      
      setSelectedSeats([]);
      updateSeats([]);
      setTimeLeft(null);
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };


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

  useEffect(() => {
    console.log("SeatMap - Sync Effect", { 
        currentId: currentSession?.movieId, 
        currentDate: currentSession?.date, 
        currentTime: currentSession?.time,
        propId: movie._id,
        propDate: date,
        propTime: time
    });

    // Check if session matches
    if (String(currentSession?.movieId) === String(movie._id) && currentSession?.date === date && currentSession?.time === time) {
        console.log("SeatMap - Session matched, setting seats:", currentSession.seats);
        setSelectedSeats(currentSession.seats);
    } else {
        console.log("SeatMap - Session mismatch, starting new...");
        // Start new session
        startSession(
            movie,
            date,
            time,
            movie.price || 4500 // Default price fallback
        );
    }
  }, [movie._id, date, time, currentSession]); // Check dependencies carefully

  const handleSeatClick = (row: number, col: number) => {
    const seatLabel = `${String.fromCharCode(65 + row)}${col + 1}`;
    const myId = userId || guestId;
    
    // Check if booked or locked by someone else
    if (bookedSeats.includes(seatLabel)) return;
    if (lockedSeats[seatLabel] && lockedSeats[seatLabel] !== myId) {
        toast.error("This seat is currently being booked by someone else");
        return;
    }

    // Toggle selection
    let newSelection = [...selectedSeats];
    if (selectedSeats.includes(seatLabel)) {
        // Deselecting
        newSelection = newSelection.filter(s => s !== seatLabel);
        socketRef.current?.emit("release-seat", {
            showtimeId,
            seatLabel
        });
    } else {
        // Selecting
        if (selectedSeats.length >= 5) {
            toast.error("You can only select up to 5 seats");
            return;
        }

        newSelection.push(seatLabel);
        socketRef.current?.emit("select-seat", {
            showtimeId,
            seatLabel,
            userId: myId
        });
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
      
      {/* Timer Bar */}
      {timeLeft !== null && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 border border-yellow-500/30 backdrop-blur-md text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
               <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
               <span className="text-sm font-medium text-gray-300">Seats reserved for:</span>
               <span className={clsx("font-mono font-bold text-lg tab-num", timeLeft < 60 ? "text-red-500" : "text-yellow-400")}>
                   {formatTime(timeLeft)}
               </span>
          </div>
      )}

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
      <div className="w-full overflow-x-auto pb-12 disable-scrollbars">
        <div className="flex gap-4 items-start min-w-max px-4 mx-auto w-fit">
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
                                
                                const myId = userId || guestId;
                                const lockedByOther = lockedSeats[seatLabel] && lockedSeats[seatLabel] !== myId;
                                
                                const isMiddleGap = c === halfCols - 1;

                                let statusColor = "bg-[#3A3A45] hover:bg-[#4A4A55] text-gray-300"; // Available
                                let bottomBorder = "border-b-4 border-[#25252E]";

                                if (isBooked) {
                                    statusColor = "bg-[#5c0000] text-red-200/50 cursor-not-allowed";
                                    bottomBorder = "border-b-4 border-[#3a0000]";
                                } else if (lockedByOther) {
                                     statusColor = "bg-yellow-900/50 text-yellow-500/50 cursor-not-allowed";
                                     bottomBorder = "border-b-4 border-yellow-900";
                                } else if (isSelected) {
                                    statusColor = "bg-[#e50914] shadow-[0_0_15px_rgba(229,9,20,0.6)] text-white";
                                    bottomBorder = "border-b-4 border-[#b00710]";
                                }

                                return (
                                    <div key={seatLabel} className={clsx("flex", isMiddleGap && "mr-10")}>
                                        <button
                                            onClick={() => handleSeatClick(r, c)}
                                            disabled={isBooked || !!lockedByOther}
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
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-yellow-900/50 rounded-t-md border-b-4 border-yellow-900"></div>
            <span>Reserved</span>
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
