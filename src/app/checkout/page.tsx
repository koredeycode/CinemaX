"use client";

import dynamic from 'next/dynamic';

// Dynamically import the client component with ssr: false
const CheckoutClient = dynamic(() => import('./CheckoutClient'), { 
    ssr: false,
    loading: () => (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    )
});

export default function CheckoutPage() {
  return <CheckoutClient />;
}
