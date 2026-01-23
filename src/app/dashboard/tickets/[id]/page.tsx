
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Booking {
  _id: string;
  movieId: {
     title: string;
     posterUrl: string;
  };
  date: string;
  time: string;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/bookings") 
      .then(res => res.json())
      .then(data => {
         if (data.success) {
             const found = data.bookings.find((b: { _id: string; }) => b._id === id);
             setBooking(found || null);
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

  if (booking.status !== 'confirmed') {
      return (
          <div className="max-w-4xl mx-auto p-4 text-center py-20">
              <div className="bg-yellow-900/20 text-yellow-500 p-6 rounded-xl border border-yellow-500/30 inline-block">
                  <h2 className="text-xl font-bold mb-2">Ticket Not Available</h2>
                  <p>This booking is currently <strong>{booking.status}</strong>.</p>
                  <p className="text-sm mt-2 opacity-80">Tickets are only generated for confirmed bookings.</p>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
       <div className="mb-8 text-center">
           <h1 className="text-3xl font-bold text-white mb-2">Your Ticket</h1>
           <p className="text-gray-400">Your ticket is ready. You can view it below or download it.</p>
       </div>

       {/* PDF Viewer Iframe */}
       <div className="w-full aspect-[2.4/1] min-h-[300px] bg-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <iframe 
                src={`/api/tickets/${id}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full border-0"
                title="Ticket PDF"
            />
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
