"use client";

import { useCartStore } from "@/store/cartStore";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { toast } from "sonner";

export default function SessionTimer() {
  const { currentSession, updateSeats } = useCartStore();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const socketRef = useRef<any>(null);

  // Initialize Socket for release events
  useEffect(() => {
    socketRef.current = io({
      path: "/api/socket/io",
      addTrailingSlash: false,
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!currentSession?.expiresAt || currentSession.seats.length === 0) {
      if (timeLeft !== null) setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const expiresAt = currentSession.expiresAt!;
      const diff = Math.ceil((expiresAt - now) / 1000);

      if (diff <= 0) {
        clearInterval(interval);
        handleExpiry();
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession?.expiresAt, currentSession?.seats.length]);

  const handleExpiry = () => {
    toast.warning("Seat reservation expired! Please try again.");
    
    // Release seats on socket
    if (currentSession?.movie && currentSession.seats.length > 0) {
      const showtimeId = `${currentSession.movie._id}:${currentSession.date}:${currentSession.time}`;
      currentSession.seats.forEach(seat => {
          socketRef.current?.emit("release-seat", {
              showtimeId,
              seatLabel: seat
          });
      });
    }

    // Clear local state
    updateSeats([]);
    setTimeLeft(null);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (timeLeft === null) return null;

  return (
    <div className="fixed top-20 right-4 z-[99] animate-in slide-in-from-right-10 fade-in duration-300">
       <div className="bg-gray-900/90 border border-yellow-500/30 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
          <div className="flex flex-col">
             <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Reserved</span>
             <span className={clsx("font-mono font-bold text-lg leading-none tab-num", timeLeft < 60 ? "text-red-500" : "text-yellow-400")}>
                 {formatTime(timeLeft)}
             </span>
          </div>
       </div>
    </div>
  );
}
