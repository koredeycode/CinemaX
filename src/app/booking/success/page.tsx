"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
    const searchParams = useSearchParams();
    const bookingId = searchParams?.get("bookingId");

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-gray-400 mb-8 max-w-md">
                Your tickets have been booked successfully. Order ID: <span className="text-white font-mono">{bookingId}</span>
            </p>

            <div className="flex gap-4">
                <Link 
                    href="/" 
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Back to Home
                </Link>
                <button 
                    onClick={() => window.open(`/api/tickets/${bookingId}`, '_blank')}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-primary/20"
                >
                    Download Tickets
                </button>
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
