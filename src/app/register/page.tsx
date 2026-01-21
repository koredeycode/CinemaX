"use client";

import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner"; // Assuming sonner is used based on checkout page

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Update local auth store
        login(data.user, data.token);
        
        toast.success("Account created successfully!");
        
        // Use a slight delay or just push.
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "Registration failed");
        toast.error(data.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred");
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full bg-gray-900 rounded-xl border border-gray-800 p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Create an Account</h1>
        
        {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none"
              required
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none"
              required
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none"
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
