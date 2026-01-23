"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Complaint {
  _id: string;
  subject: string;
  message: string;
  status: "pending" | "resolved";
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/admin/complaints");
      const data = await res.json();
      if (data.success) {
        setComplaints(data.complaints);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
      try {
          const res = await fetch("/api/admin/complaints", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id, status: newStatus })
          });
          const data = await res.json();
          if (data.success) {
              toast.success("Status updated");
              setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: newStatus as any } : c));
          } else {
              toast.error("Failed to update status");
          }
      } catch (error) {
          toast.error("Error updating status");
      }
  };



  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">User Complaints</h1>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-950 text-gray-400 uppercase text-xs">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Subject</th>
              <th className="p-4">Message</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-300">
            {loading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                        <td className="p-4">
                            <div className="space-y-1">
                                <Skeleton className="w-32 h-4" />
                                <Skeleton className="w-24 h-3" />
                            </div>
                        </td>
                        <td className="p-4"><Skeleton className="w-48 h-4" /></td>
                        <td className="p-4"><Skeleton className="w-64 h-4" /></td>
                        <td className="p-4"><Skeleton className="w-24 h-6" /></td>
                        <td className="p-4"><Skeleton className="w-24 h-4" /></td>
                        <td className="p-4"><Skeleton className="w-20 h-6" /></td>
                    </tr>
                 ))
            ) : complaints.length === 0 ? (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">No complaints found.</td>
                </tr>
            ) : (
                complaints.map(complaint => (
                    <tr key={complaint._id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="p-4">
                            <div>
                                <div className="font-bold text-white">{complaint.user?.name || "Unknown"}</div>
                                <div className="text-xs text-gray-500">{complaint.user?.email}</div>
                            </div>
                        </td>
                        <td className="p-4 font-medium">{complaint.subject}</td>
                        <td className="p-4 text-sm text-gray-400 max-w-xs">{complaint.message}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                complaint.status === 'resolved' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                            }`}>
                                {complaint.status}
                            </span>
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                            {complaint.status === 'pending' && (
                                <button 
                                    onClick={() => handleStatusUpdate(complaint._id, 'resolved')}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                                >
                                    Mark Resolved
                                </button>
                            )}
                        </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
