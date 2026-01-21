"use client";

import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
      <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="w-10 h-10 text-green-500"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
        <p className="text-gray-400 mb-8">
          Your booking has been confirmed. A confirmation email has been sent to your inbox.
        </p>

        <div className="flex flex-col gap-4 max-w-sm mx-auto">
          {user ? (
            <Link
              href="/dashboard/bookings"
              className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors"
            >
              View My Bookings
            </Link>
          ) : (
            <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                    <p className="text-sm text-gray-300 mb-3">Create an account to manage your bookings and earn rewards.</p>
                    <Link
                        href="/register"
                        className="block bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
                    >
                        Create Account
                    </Link>
                </div>
            </div>
          )}
          
          <Link
            href="/"
            className="text-gray-500 hover:text-white transition-colors text-sm font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
