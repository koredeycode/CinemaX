import { Suspense } from "react";
import BookingClient from "./BookingClient";

const BookingSkeleton = () => (
    <div className="container mx-auto px-4 py-12">
        <div className="h-8 w-64 mx-auto bg-gray-800 rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-48 mx-auto bg-gray-800 rounded mb-8 animate-pulse"></div>
        
        <div className="w-full max-w-5xl mx-auto p-6 bg-gray-900/50 rounded-xl border border-gray-800 animate-pulse min-h-[500px] flex flex-col items-center">
            <div className="w-full max-w-2xl h-12 mb-10 relative">
                <div className="absolute top-0 left-0 w-full h-full border-t-4 border-gray-700 rounded-[50%] opacity-50"></div>
            </div>
                <div className="flex gap-4">
                    <div className="flex flex-col gap-3 pt-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className={`w-4 h-8 bg-gray-800 rounded ${i === 3 ? 'mb-10' : ''}`}></div>
                    ))}
                    </div>
                    <div className="flex gap-8">
                    <div className="grid grid-cols-4 gap-3">
                        {Array.from({ length: 32 }).map((_, i) => (
                            <div key={i} className={`w-9 h-8 bg-gray-800 rounded-lg ${i >= 12 && i < 16 ? 'mb-10' : ''}`}></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                            {Array.from({ length: 32 }).map((_, i) => (
                            <div key={i} className={`w-9 h-8 bg-gray-800 rounded-lg ${i >= 12 && i < 16 ? 'mb-10' : ''}`}></div>
                        ))}
                    </div>
                    </div>
            </div>
        </div>
    </div>
);

export default function BookingPage() {
    return (
        <Suspense fallback={<BookingSkeleton />}>
            <BookingClient />
        </Suspense>
    );
}
