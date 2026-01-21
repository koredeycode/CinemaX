"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const res = await fetch("/api/user/complaints", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject, message })
        });
        
        const data = await res.json();
        
        if (data.success) {
            toast.success("Complaint submitted successfully!");
            setSubject("");
            setMessage("");
        } else {
            toast.error(data.message || "Failed to submit");
        }
    } catch (error) {
        toast.error("Something went wrong");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-6">Support & Complaints</h1>
        
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Subject</label>
                    <select 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg p-3 focus:border-primary focus:outline-none"
                        required
                    >
                        <option value="">Select a topic...</option>
                        <option value="Booking Issue">Booking Issue</option>
                        <option value="Payment Issue">Payment Issue</option>
                        <option value="Refund Request">Refund Request</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Message</label>
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your issue..."
                        rows={5}
                        className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg p-3 focus:border-primary focus:outline-none"
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                    {loading ? "Submitting..." : "Submit Complaint"}
                </button>
            </form>
        </div>
    </div>
  );
}
