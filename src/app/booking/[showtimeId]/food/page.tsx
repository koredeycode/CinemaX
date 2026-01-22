"use client";

import { IConcession } from "@/models/Concession";
import { useCartStore } from "@/store/cartStore";
import clsx from "clsx";
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
  const [activeTab, setActiveTab] = useState<'snacks' | 'drinks'>('snacks');

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

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

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
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl animate-pulse">
        <div className="h-8 w-64 bg-gray-800 rounded mb-4"></div>
        <div className="h-4 w-full md:w-96 bg-gray-900 rounded mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
           <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-900/50 rounded-xl border border-gray-800"></div>
              ))}
           </div>
           <div className="hidden lg:block lg:col-span-1 h-64 bg-gray-900/50 rounded-xl border border-gray-800"></div>
        </div>
      </div>
    );
  }

  const snacks = concessions.filter(c => c.category !== 'drink');
  const drinks = concessions.filter(c => c.category === 'drink');

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-none container mx-auto px-4 py-8 lg:py-8 max-w-6xl">
            <h1 className="text-3xl font-bold text-white mb-2">Add Snacks & Drinks</h1>
            <p className="text-gray-400">Enhance your movie experience with some treats.</p>
        </div>

        {/* Main Content Area - Grow to fill space */}
        <div className="flex-1 container mx-auto px-4 max-w-6xl min-h-0 pb-24 lg:pb-8">
            <div className="h-full flex flex-col lg:flex-row gap-8 lg:gap-12">
            
                {/* Mobile Tabs - Fixed within flex container */}
                <div className="lg:hidden flex-none pb-4">
                    <div className="flex w-full bg-gray-900/50 p-1 rounded-xl border border-gray-800">
                        <button 
                            onClick={() => setActiveTab('snacks')}
                            className={clsx(
                                "flex-1 py-3 rounded-lg text-sm font-bold transition-all",
                                activeTab === 'snacks' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
                            )}
                        >
                            Snacks
                        </button>
                        <button 
                            onClick={() => setActiveTab('drinks')}
                            className={clsx(
                                "flex-1 py-3 rounded-lg text-sm font-bold transition-all",
                                activeTab === 'drinks' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
                            )}
                        >
                            Drinks
                        </button>
                    </div>
                </div>

                {/* Left Side: Scrollable Lists */}
                <div className="flex-1 lg:h-full lg:overflow-hidden pr-2 lg:pr-0">
                    <div className="h-full lg:grid lg:grid-cols-2 lg:gap-8 space-y-4 lg:space-y-0">
                        {/* Snacks Column */}
                        <div className={clsx("space-y-4 lg:h-full lg:overflow-y-auto custom-scrollbar lg:pr-2 lg:pb-12", activeTab === 'snacks' ? 'block' : 'hidden md:block')}>
                            <h2 className="hidden md:block text-xl font-bold text-white mb-4 sticky top-0 bg-black/95 py-2 z-10 backdrop-blur-sm">Snacks</h2>
                            {snacks.map((item) => (
                                <div
                                    key={String(item._id)}
                                    className={clsx(
                                        "flex items-center justify-between p-4 bg-gray-900/40 rounded-xl border transition-all",
                                        cart[String(item._id)] ? "border-primary/50 bg-primary/5" : "border-gray-800 hover:border-gray-700"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl w-12 h-12 flex items-center justify-center bg-gray-800/50 rounded-lg">
                                            {item.emoji}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-base">{item.name}</h3>
                                            <p className="text-primary font-medium">₦{item.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1 border border-white/5">
                                        <button
                                            onClick={() => updateQuantity(String(item._id), -1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            disabled={!cart[String(item._id)]}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <span className={clsx("w-6 text-center font-bold", cart[String(item._id)] > 0 ? "text-white" : "text-gray-500")}>
                                            {cart[String(item._id)] || 0}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(String(item._id), 1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                                        >
                                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Drinks Column */}
                        <div className={clsx("space-y-4 lg:h-full lg:overflow-y-auto custom-scrollbar lg:pr-2 lg:pb-12", activeTab === 'drinks' ? 'block' : 'hidden md:block')}>
                           <h2 className="hidden md:block text-xl font-bold text-white mb-4 sticky top-0 bg-black/95 py-2 z-10 backdrop-blur-sm">Drinks</h2>
                           {drinks.map((item) => (
                                <div
                                    key={String(item._id)}
                                    className={clsx(
                                        "flex items-center justify-between p-4 bg-gray-900/40 rounded-xl border transition-all",
                                        cart[String(item._id)] ? "border-primary/50 bg-primary/5" : "border-gray-800 hover:border-gray-700"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl w-12 h-12 flex items-center justify-center bg-gray-800/50 rounded-lg">
                                            {item.emoji}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-base">{item.name}</h3>
                                            <p className="text-primary font-medium">₦{item.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1 border border-white/5">
                                        <button
                                            onClick={() => updateQuantity(String(item._id), -1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            disabled={!cart[String(item._id)]}
                                        >
                                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <span className={clsx("w-6 text-center font-bold", cart[String(item._id)] > 0 ? "text-white" : "text-gray-500")}>
                                            {cart[String(item._id)] || 0}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(String(item._id), 1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                                        >
                                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Desktop Sticky Sidebar */}
                <div className="hidden lg:block lg:w-96 lg:flex-none lg:h-full lg:overflow-y-auto custom-scrollbar">
                    <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            Order Summary
                        </h3>
                        
                        <div className="space-y-4 mb-8 min-h-[150px] max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {Object.keys(cart).length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 py-12">
                                    <span className="text-4xl mb-3 opacity-50">🍿</span>
                                    <p className="text-sm">No snacks selected yet</p>
                                </div>
                            ) : (
                                Object.entries(cart).map(([itemId, qty]) => {
                                    const item = concessions.find((i) => String(i._id) === itemId);
                                    if (!item) return null;
                                    return (
                                        <div key={itemId} className="flex justify-between items-center bg-gray-800/40 p-3 rounded-xl border border-white/5">
                                            <span className="text-gray-300 font-medium text-sm">{qty}x {item.name}</span>
                                            <span className="text-white font-bold text-sm">₦{(item.price * qty).toLocaleString()}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="border-t border-white/10 pt-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Total</span>
                                <span className="text-3xl font-black text-primary">₦{totalPrice.toLocaleString()}</span>
                            </div>
                            
                            <button
                                onClick={handleProceed}
                                className="w-full bg-primary hover:bg-red-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all transform hover:scale-105"
                            >
                                Checkout
                            </button>
                             {Object.keys(cart).length === 0 && (
                                <button
                                    onClick={() => router.push("/checkout")}
                                    className="w-full py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                                >
                                    Skip Snacks
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Mobile Fixed Bottom Bar */}
        <div className="lg:hidden fixed bottom-6 left-4 right-4 bg-gray-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl z-50">
             <div className="flex items-center gap-4">
                 <div className="flex-1">
                     <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Total</p>
                     <p className="text-2xl font-black text-white">₦{totalPrice.toLocaleString()}</p>
                 </div>
                 <button
                    onClick={handleProceed}
                    className="flex-1 bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/25"
                >
                    Checkout {totalItems > 0 && `(${totalItems})`}
                </button>
             </div>
        </div>
    </div>
  );
}
