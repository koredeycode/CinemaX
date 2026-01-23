"use client";

import { IMovie } from "@/models/Movie";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BookingSelectorProps {
  movie: IMovie;
}

export default function BookingSelector({ movie }: BookingSelectorProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(movie.schedule[0]?.date || "");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const scheduleForDate = movie.schedule.find(s => s.date === selectedDate);

  const handleBook = () => {
    if (!selectedDate || !selectedTime) return;
    router.push(`/booking?movieId=${movie._id}&date=${selectedDate}&time=${selectedTime}`);
  };

  if (!movie.schedule || movie.schedule.length === 0) {
      return <div className="text-gray-500">No showtimes available.</div>;
  }

  return (
    <div className="space-y-6">
        {/* Date Selection */}
        <div>
            <h3 className="text-gray-400 text-sm font-bold uppercase mb-3">Select Date</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {movie.schedule.map((slot) => {
                    const dateObj = new Date(slot.date);
                    const isSelected = selectedDate === slot.date;
                    
                    return (
                        <button
                            key={slot.date}
                            onClick={() => { setSelectedDate(slot.date); setSelectedTime(""); }}
                            className={clsx(
                                "flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl border transition-all",
                                isSelected 
                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                                    : "bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800 hover:border-gray-500"
                            )}
                        >
                            <span className="text-xs font-medium uppercase">{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className="text-xl font-bold">{dateObj.getDate()}</span>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Time Selection */}
        <div className="min-h-[100px]">
            <h3 className="text-gray-400 text-sm font-bold uppercase mb-3">Select Time</h3>
            <div className="flex flex-wrap gap-3">
                {scheduleForDate?.times.map((time) => (
                    <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={clsx(
                            "px-6 py-2 rounded-lg text-sm font-bold border transition-all",
                            selectedTime === time
                                ? "bg-white text-black border-white scale-105"
                                : "bg-transparent text-gray-300 border-gray-600 hover:border-gray-400"
                        )}
                    >
                        {time}
                    </button>
                ))}
            </div>
        </div>

        {/* Action Button */}
        <button
            onClick={handleBook}
            disabled={!selectedDate || !selectedTime}
            className={clsx(
                "w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all",
                selectedDate && selectedTime
                    ? "bg-primary text-white hover:bg-red-700 transform hover:scale-[1.02] shadow-primary/25"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed"
            )}
        >
            Select Seats
        </button>
    </div>
  );
}
