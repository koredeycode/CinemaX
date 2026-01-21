"use client";

import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface Booking {
  _id: string;
  showtime: {
     movie: {
         title: string;
         posterUrl: string;
     };
     startTime: string;
  };
  totalPrice: number;
  status: string;
  seats: string[];
  guestDetails?: {
      name: string;
  };
   paymentIntentId: string; // reference
}

export default function TicketPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [qrCodeData, setQrCodeData] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/bookings") 
      .then(res => res.json())
      .then(data => {
         if (data.success) {
             const found = data.bookings.find((b: { _id: string; }) => b._id === id);
             setBooking(found || null);
             if (found) {
                 QRCode.toDataURL(found._id) // Use Booking ID for QR to match PDF
                    .then(url => setQrCodeData(url));
             }
         }
         setLoading(false);
      });
  }, [id]);

  const handleDownload = () => {
      // Use the backend API which generates the consistent landscape PDF
      window.open(`/api/tickets/${id}`, '_blank');
  };

  if (loading) return (
      <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
  );
  
  if (!booking) return <div className="text-white p-8">Ticket not found</div>;

  const dateStr = new Date(booking.showtime.startTime).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = new Date(booking.showtime.startTime).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-4xl mx-auto p-4">
       <div className="mb-8 text-center">
           <h1 className="text-3xl font-bold text-white mb-2">Your Ticket</h1>
           <p className="text-gray-400">Ready for the show! You can download the PDF version below.</p>
       </div>

       {/* Ticket Container - Landscape */}
       <div className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[300px] w-full max-w-[800px] mx-auto">
           {/* Left Header Strip (Red) - Hidden on mobile, shown on desktop */}
           <div className="hidden md:flex w-16 bg-red-700 items-end justify-center py-8 relative">
                <span className="text-white font-bold tracking-[0.2em] transform -rotate-90 whitespace-nowrap absolute bottom-24 text-xl">
                    CINEMA TICKET
                </span>
           </div>

           {/* Main Section */}
           <div className="flex-1 p-8 relative border-b-2 md:border-b-0 md:border-r-2 border-dashed border-gray-300">
               {/* Mobile "Strip" */}
               <div className="md:hidden bg-red-700 text-white text-center py-2 mb-4 rounded font-bold tracking-widest">
                   CINEMA TICKET
               </div>

               <h2 className="text-3xl md:text-4xl font-black text-gray-800 leading-tight mb-8 uppercase">
                   {booking.showtime.movie.title}
               </h2>

               <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                   <div>
                       <p className="text-xs text-gray-400 font-medium mb-1">DATE</p>
                       <p className="text-lg font-bold text-gray-800">{dateStr}</p>
                   </div>
                   <div>
                       <p className="text-xs text-gray-400 font-medium mb-1">TIME</p>
                       <p className="text-lg font-bold text-gray-800">{timeStr}</p>
                   </div>
                   <div>
                       <p className="text-xs text-gray-400 font-medium mb-1">HALL</p>
                       <p className="text-lg font-bold text-gray-800">HALL 1</p>
                   </div>
                   <div>
                       <p className="text-xs text-gray-400 font-medium mb-1">GUEST</p>
                       <div className="text-lg font-bold text-gray-800 truncate" title={booking.guestDetails?.name || "Guest"}>
                          {booking.guestDetails?.name || "Guest"}
                       </div>
                   </div>
               </div>

               {/* Cutout Circles for perforation effect */}
               <div className="absolute -top-3 -right-3 w-6 h-6 bg-black rounded-full hidden md:block"></div>
               <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-black rounded-full hidden md:block"></div>
           </div>

           {/* Stub Section */}
           <div className="w-full md:w-80 bg-gray-50 p-8 flex flex-col items-center justify-between relative">
               <div className="w-full bg-red-700 text-white text-center py-2 rounded-lg font-bold text-lg mb-4">
                   ADMIT ONE
               </div>

               <div className="text-center w-full mb-4">
                   <p className="text-xs text-gray-400 font-medium mb-1">SEAT</p>
                   <p className="text-4xl font-black text-gray-800 break-words leading-none">
                       {booking.seats.length > 3 ? `${booking.seats[0]} +${booking.seats.length - 1}` : booking.seats.join(", ")}
                   </p>
               </div>

               <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                    {qrCodeData && (
                        <img src={qrCodeData} alt="QR Code" className="w-32 h-32 object-contain" />
                    )}
               </div>
               
               <p className="text-[10px] text-gray-400 mt-2 font-mono">
                   ID: {booking._id.substring(0,8).toUpperCase()}
               </p>

                {/* Cutout Circles for perforation effect (Stub side) */}
               <div className="absolute -top-3 -left-3 w-6 h-6 bg-black rounded-full hidden md:block"></div>
               <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-black rounded-full hidden md:block"></div>
           </div>
       </div>

       <div className="mt-8 flex justify-center">
           <button 
              onClick={handleDownload}
              className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-3 shadow-lg shadow-primary/25"
           >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download PDF Version
           </button>
       </div>
    </div>
  );
}
