"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
    const searchParams = useSearchParams();
    const refId = searchParams?.get("refId") || searchParams?.get("reference");

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="bg-green-900/20 text-green-500 p-8 rounded-2xl border border-green-500/30 text-center max-w-md w-full">
                <div className="mb-6 flex justify-center">
                    <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
                <p className="text-lg opacity-80 mb-6">
                Your tickets have been booked successfully. Order ID: <span className="text-white font-mono">{refId}</span>
                </p>

                <div className="space-y-4">
                    <button 
                        onClick={() => window.location.href = `/dashboard/tickets/${refId}`}
                        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition"
                    >
                        View Ticket
                    </button>
                    <button 
                        onClick={() => window.open(`/api/tickets/${refId}`, '_blank')}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-primary/20"
                >
                    Download Tickets
                </button>
            </div>
        </div>
    </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 animate-pulse">
                <div className="w-16 h-16 bg-gray-800 rounded-full mb-6"></div>
                <div className="h-8 w-64 bg-gray-800 rounded mb-4"></div>
                <div className="h-4 w-48 bg-gray-800 rounded mb-8"></div>
                <div className="flex gap-4">
                    <div className="h-12 w-32 bg-gray-800 rounded-lg"></div>
                    <div className="h-12 w-40 bg-gray-800 rounded-lg"></div>
                </div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
