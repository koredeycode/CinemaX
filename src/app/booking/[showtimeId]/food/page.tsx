"use client"

import { IConcession } from "@/models/Concession";
import { useCartStore } from "@/store/cartStore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function FoodSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const showtimeId = params?.showtimeId as string;
  const { currentSession, updateConcessions } = useCartStore();

  const [concessions, setConcessions] = useState<IConcession[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Load concessions
    fetch("/api/concessions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setConcessions(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Hydrate local cart from session if it exists and matches this flow
  useEffect(() => {
    if (currentSession && currentSession.showtimeId === showtimeId && currentSession.concessions.length > 0) {
        const initialCart: { [key: string]: number } = {};
        currentSession.concessions.forEach(c => {
            initialCart[c.id] = c.quantity;
        });
        setCart(initialCart);
    }
  }, [currentSession, showtimeId]);

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const totalPrice = Object.entries(cart).reduce((total, [itemId, qty]) => {
    const item = concessions.find((i) => String(i._id) === itemId);
    return total + (item?.price || 0) * qty;
  }, 0);

  const handleProceed = () => {
    // Transform cart to session concession format
    const selectedConcessions = Object.entries(cart).map(([itemId, qty]) => {
        const item = concessions.find((i) => String(i._id) === itemId);
        if (!item) return null;
        return {
            id: itemId,
            name: item.name,
            price: item.price,
            quantity: qty,
            emoji: item.emoji
        };
    }).filter(Boolean) as any[];

    updateConcessions(selectedConcessions);
    router.push("/checkout");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl animate-pulse">
        <div className="h-8 w-64 bg-gray-800 rounded mb-4"></div>
        <div className="h-4 w-96 bg-gray-900 rounded mb-10"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start h-[calc(100vh-200px)]">
           {/* Left Column Skeleton */}
           <div className="lg:col-span-2 h-full overflow-hidden pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                  {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
                              <div>
                                  <div className="h-5 w-32 bg-gray-800 rounded mb-2"></div>
                                  <div className="h-4 w-16 bg-gray-800 rounded"></div>
                              </div>
                          </div>
                           <div className="w-24 h-8 bg-gray-800 rounded-lg"></div>
                      </div>
                  ))}
              </div>
           </div>

           {/* Right Column Skeleton */}
           <div className="lg:col-span-1 h-full">
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 h-full flex flex-col">
                  <div className="h-6 w-40 bg-gray-800 rounded mb-8"></div>
                  <div className="space-y-4 flex-1">
                      <div className="h-10 bg-gray-800 rounded hover:bg-gray-700/50"></div>
                      <div className="h-10 bg-gray-800 rounded hover:bg-gray-700/50"></div>
                  </div>
                   <div className="mt-auto pt-6 border-t border-gray-800">
                       <div className="flex justify-between mb-2">
                           <div className="h-4 w-12 bg-gray-800 rounded"></div>
                           <div className="h-6 w-24 bg-gray-800 rounded"></div>
                       </div>
                       <div className="h-12 w-full bg-gray-800 rounded-xl mt-4"></div>
                       <div className="h-10 w-full bg-gray-900 rounded-xl mt-3"></div>
                   </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-bold text-white mb-2">Add Snacks & Drinks</h1>
      <p className="text-gray-400 mb-8">Enhance your movie experience with some treats.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start h-[calc(100vh-200px)]">
        {/* Left Column: Concessions List - Scrollable */}
        <div className="lg:col-span-2 h-full overflow-y-auto pr-4 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                {/* Snacks Column */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-4 sticky top-0 bg-black/90 py-2 z-10">Snacks</h2>
                    <div className="flex flex-col gap-4">
                        {concessions.filter(c => c.category !== 'drink').map((item) => (
                            <div
                                key={String(item._id)}
                                className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                <span className="text-4xl">{item.emoji}</span>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{item.name}</h3>
                                    <p className="text-primary font-medium">₦{item.price.toLocaleString()}</p>
                                </div>
                                </div>
                                
                                <div className="flex items-center gap-4 bg-gray-800 rounded-lg p-1">
                                <button
                                    onClick={() => updateQuantity(String(item._id), -1)}
                                    className="w-8 h-8 flex items-center justify-center rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
                                    disabled={!cart[String(item._id)]}
                                >
                                    -
                                </button>
                                <span className="w-6 text-center text-white font-bold">{cart[String(item._id)] || 0}</span>
                                <button
                                    onClick={() => updateQuantity(String(item._id), 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded bg-gray-700 text-white hover:bg-gray-600"
                                >
                                    +
                                </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Drinks Column */}
                <div>
                   <h2 className="text-xl font-bold text-white mb-4 sticky top-0 bg-black/90 py-2 z-10">Drinks</h2>
                   <div className="flex flex-col gap-4">
                        {concessions.filter(c => c.category === 'drink').map((item) => (
                            <div
                                key={String(item._id)}
                                className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                <span className="text-4xl">{item.emoji}</span>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{item.name}</h3>
                                    <p className="text-primary font-medium">₦{item.price.toLocaleString()}</p>
                                </div>
                                </div>
                                
                                <div className="flex items-center gap-4 bg-gray-800 rounded-lg p-1">
                                <button
                                    onClick={() => updateQuantity(String(item._id), -1)}
                                    className="w-8 h-8 flex items-center justify-center rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
                                    disabled={!cart[String(item._id)]}
                                >
                                    -
                                </button>
                                <span className="w-6 text-center text-white font-bold">{cart[String(item._id)] || 0}</span>
                                <button
                                    onClick={() => updateQuantity(String(item._id), 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded bg-gray-700 text-white hover:bg-gray-600"
                                >
                                    +
                                </button>
                                </div>
                            </div>
                        ))}
                   </div>
                </div>
            </div>
        </div>

        {/* Right Column: Order Summary - Fixed */}
        <div className="lg:col-span-1 h-full">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 h-full flex flex-col">
                <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
                
                {/* Selected Items List - Scrollable within summary if needed */}
                <div className="space-y-4 mb-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {Object.keys(cart).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                            <span className="text-4xl mb-2">🍿</span>
                            <p className="text-sm italic">No snacks selected</p>
                        </div>
                    ) : (
                         Object.entries(cart).map(([itemId, qty]) => {
                             const item = concessions.find((i) => String(i._id) === itemId);
                             if (!item) return null;
                             return (
                                 <div key={itemId} className="flex justify-between text-sm items-center bg-gray-800/50 p-3 rounded-lg">
                                     <span className="text-gray-300">{qty}x {item.name}</span>
                                     <span className="text-white font-medium">₦{(item.price * qty).toLocaleString()}</span>
                                 </div>
                             );
                         })
                    )}
                </div>

                <div className="border-t border-gray-800 pt-4 mb-6 mt-auto">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Total</span>
                        <span className="text-2xl font-bold text-primary">₦{totalPrice.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleProceed}
                        className="w-full bg-primary text-white px-6 py-4 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-primary/25"
                    >
                        Checkout
                    </button>
                    {Object.keys(cart).length === 0 && (
                        <button
                            onClick={() => router.push("/checkout")}
                            className="w-full px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                            Skip Snacks
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
