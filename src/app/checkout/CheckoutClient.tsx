"use client";

import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useAuthStore } from '@/store/authStore';
import { PaystackButton } from "react-paystack";
import { toast } from "sonner";

export default function CheckoutClient() {
  const { currentSession, cart, addToCart, removeFromCart, editSession, getTotal, updateGuestDetails, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const router = useRouter(); 
  const isEditingRef = useRef(false);
  const [reference, setReference] = useState("");

  const total = getTotal();
  const processingFee = 0; 
  const totalAmount = (total + processingFee) * 100;

  const isFormValid = form.name && form.email && form.phone;

  // Generate alphanumeric reference
  const generateReference = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'CX-';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
  };

  // Generate new reference when cart or total changes
  useEffect(() => {
      setReference(generateReference());
  }, [cart.length, total]);

  // Debug logging
  console.log("Paystack Public Key:", process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ? "Present" : "Missing");

  const [itemToRemove, setItemToRemove] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Prevent auto-moving to cart if we just clicked edit (which populated currentSession)
    if (isEditingRef.current) return;

    if (currentSession && (currentSession.seats.length > 0 || currentSession.concessions.length > 0)) {
        addToCart();
    }
    
    // Priority: Last Item Guest -> Current Session Guest -> Logged In User
    const lastItem = cart[cart.length - 1];
    if (lastItem?.guest && (lastItem.guest.name || lastItem.guest.email)) {
        setForm(lastItem.guest);
    } else if (currentSession?.guest && (currentSession.guest.name || currentSession.guest.email)) {
        setForm(currentSession.guest);
    } else if (user) {
        setForm({ name: user.name, email: user.email, phone: "" });
    }
  }, [currentSession, addToCart, cart, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    updateGuestDetails(nextForm); 
  };
  
  const confirmRemoveItem = (index: number) => {
      setItemToRemove(index);
  };

  const executeRemoveItem = () => {
      if (itemToRemove !== null) {
          removeFromCart(itemToRemove);
          toast.info("Item removed from cart");
          setItemToRemove(null);
      }
  };

  const handleEditItem = (index: number, path: 'seats' | 'food') => {
      const item = cart[index];
      if (!item) return;
      
      isEditingRef.current = true;
      editSession(index);
      
      if (path === 'seats') {
          router.push(`/booking/${item.showtimeId}`);
      } else {
          router.push(`/booking/${item.showtimeId}/food`);
      }
  };

  const handlePaystackSuccessAction = async (reference: any) => {
      console.log("Paystack SUCCESS Callback fired!", reference);
      const toastId = toast.loading("Processing booking...");

      try {
            // 1. Create Booking in Backend (Now that payment is confirmed)
            console.log("Creating booking for verified payment:", reference);
            // We use the reference returned from Paystack or our own if they match. 
            // reference.reference is usually the string.
            const paymentRef = reference.reference; 

            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cart: cart.map(item => ({
                        ...item,
                        user: user?.id
                    })),
                    guestDetails: form,
                    paymentReference: paymentRef
                })
            });
            
            const data = await res.json();
            if (!data.success) {
                console.error("Booking creation failed:", data);
                // Even if booking creation fails, payment succeeded. 
                toast.error("Payment successful but booking failed. Please contact support with ref: " + paymentRef, { id: toastId });
                return;
            }

            // 2. Verify Payment (To confirm booking)
            const verifyRes = await fetch("/api/bookings/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reference: paymentRef })
            });
            
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
                toast.success("Booking confirmed!", { id: toastId });
                clearCart();
                window.location.assign("/success");
            } else {
                toast.warning("Payment successful but verification pending.", { id: toastId });
                window.location.assign("/success");
            }

      } catch (error) {
          console.error(error);
          toast.error("An error occurred processing your booking.", { id: toastId });
          // Redirect anyway since payment happened
          setTimeout(() => window.location.assign("/success"), 3000);
      }
  };

  const handlePaystackCloseAction = () => {
    toast.info("Payment cancelled.");
  }

  const componentProps = {
      reference,
      email: form.email,
      amount: totalAmount,
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
      text: 'Pay Now',
      onSuccess: (reference: any) => handlePaystackSuccessAction(reference),
      onClose: handlePaystackCloseAction,
      className: "w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-primary/20"
  };

  if (!mounted) return null;

  // Show empty if cart is empty (currentSession handled by useEffect moving it to cart)
  if (cart.length === 0 && (!currentSession || (currentSession.seats.length === 0 && currentSession.concessions.length === 0))) {
     return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
             <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
                <h2 className="text-xl text-gray-400 mb-4">Your cart is empty</h2>
                <Link
                    href="/"
                    className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Browse Movies
                </Link>
             </div>
        </div>
     );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">

       <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
            </Link>
            <h1 className="text-3xl font-bold text-white">Review & Checkout</h1>
       </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Cart Items & Form */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Cart Items */}
            <div className="space-y-4">
                {cart.map((item, index) => (
                    <div key={index} className="bg-gray-900 rounded-xl p-6 border border-gray-800 relative">
                        <button 
                            onClick={() => confirmRemoveItem(index)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
                            title="Remove item"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex gap-4">
                            <div className="relative w-20 aspect-[2/3] shrink-0 rounded-lg overflow-hidden bg-gray-800">
                                {item.movie?.posterUrl && (
                                    <Image
                                        src={item.movie.posterUrl}
                                        alt={item.movie.title}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white pr-8">{item.movie?.title}</h3>
                                <p className="text-gray-400 text-sm mb-2">
                                    {item.startTime && new Date(item.startTime).toLocaleString(undefined, {
                                        weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
                                    })}
                                </p>
                                
                                <div className="flex flex-wrap gap-2 mb-3 items-center">
                                    {item.seats.map(seat => (
                                        <span key={seat} className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium border border-gray-700">
                                            {seat}
                                        </span>
                                    ))}
                                    <button 
                                        onClick={() => handleEditItem(index, 'seats')}
                                        className="text-xs text-primary hover:text-red-400 ml-2 underline"
                                    >
                                        Edit Seats
                                    </button>
                                </div>

                                {/* Snacks Summary inside Cart Item */}
                                {item.concessions.length > 0 && (
                                    <div className="bg-gray-950/50 rounded-lg p-3 text-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Snacks</p>
                                            <button 
                                                onClick={() => handleEditItem(index, 'food')}
                                                className="text-xs text-primary hover:text-red-400 underline"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <div className="space-y-1">
                                            {item.concessions.map(c => (
                                                <div key={c.id} className="flex justify-between text-gray-300">
                                                    <span>{c.quantity}x {c.name} {c.emoji}</span>
                                                    <span>₦{(c.price * c.quantity).toLocaleString()}</span>
                                                </div>
                                            ))}
                                            <div className="border-t border-gray-800 pt-1 mt-1 flex justify-between text-xs font-bold text-gray-400">
                                                <span>Snacks Total</span>
                                                <span>₦{item.concessions.reduce((acc, c) => acc + (c.price * c.quantity), 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
                             <div className="text-sm text-gray-400">
                                <span className="block">Tickets: {item.seats.length} x ₦{item.price.toLocaleString()}</span>
                             </div>
                             <div className="text-right">
                                <p className="text-xs text-gray-500">Subtotal</p>
                                <p className="text-xl font-bold text-primary">
                                    ₦{((item.seats.length * (item.price || 0)) + item.concessions.reduce((acc, c) => acc + (c.price * c.quantity), 0)).toLocaleString()}
                                </p>
                             </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Another Movie Button */}
            <Link 
                href="/"
                className="block w-full text-center py-4 border-2 border-dashed border-gray-800 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 hover:bg-gray-900 transition-all"
            >
                + Add Another Movie
            </Link>

            {/* User Details Form */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-6">Personal Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                         <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                         <input 
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg p-3 focus:border-primary focus:outline-none"
                         />
                    </div>
                    <div>
                         <label className="block text-gray-400 text-sm mb-2">Email Address</label>
                         <input 
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleInputChange}
                            placeholder="user@example.com"
                            className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg p-3 focus:border-primary focus:outline-none"
                         />
                    </div>
                    <div>
                         <label className="block text-gray-400 text-sm mb-2">Phone Number</label>
                         <input 
                            name="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleInputChange}
                            placeholder="+234..."
                            className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg p-3 focus:border-primary focus:outline-none"
                         />
                    </div>
                </div>
            </div>

        </div>

        {/* Right Column: Checkout Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Payment Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                    <span>Booking Fee</span>
                    <span>₦{processingFee.toLocaleString()}</span>
                </div>
                 <div className="border-t border-gray-800 pt-3 flex justify-between text-white font-bold text-lg">
                  <span>Total Due</span>
                  <span>₦{(total + processingFee).toLocaleString()}</span>
                </div>
              </div>

               {isFormValid ? (
                   <PaystackButton {...componentProps} />
               ) : (
                   <button disabled className="w-full bg-gray-700 text-gray-400 py-4 rounded-xl font-bold cursor-not-allowed">
                       Enter Details to Pay
                   </button>
               )}
               
               <p className="text-gray-500 text-xs text-center mt-4">
                    By clicking pay, you agree to our terms and conditions.
               </p>
            </div>
          </div>
      </div>

      <ConfirmationModal
        isOpen={itemToRemove !== null}
        onClose={() => setItemToRemove(null)}
        onConfirm={executeRemoveItem}
        title="Remove Item?"
        message="Are you sure you want to remove this item from your cart? This action cannot be undone."
        confirmText="Remove"
        isDestructive
      />
    </div>
  );
}
