"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Update local auth store
        login(data.user, data.token);

        // Check for redirect param
        const redirectPath = searchParams.get("redirect");
        
        if (redirectPath) {
             router.push(redirectPath);
        } else if (data.user.role === "admin") {
             router.push("/admin");
        } else {
             router.push("/dashboard");
        }
        router.refresh(); 
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full bg-gray-900 rounded-xl border border-gray-800 p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Login to CinemaX</h1>
        
        {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
          >
            Login
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-500">
            Don't have an account? <a href="/register" className="text-primary hover:underline">Register</a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
