import { IMovie } from "@/models/Movie";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BookingSession {
  movie: IMovie | null;
  showtimeId: string | null;
  startTime: string | null;
  seats: string[]; // ['A1', 'A2']
  price: number; // Price per seat
  concessions: {
    id: string; // concession ID
    name: string;
    price: number;
    quantity: number;
    emoji: string;
  }[];
  guest: {
    name: string;
    email: string;
    phone: string;
  };
}

interface CartState {
  currentSession: BookingSession | null;
  cart: BookingSession[];
  
  startSession: (movie: IMovie, showtimeId: string, startTime: string, price: number) => void;
  updateSeats: (seats: string[]) => void;
  updateConcessions: (items: BookingSession["concessions"]) => void;
  updateGuestDetails: (guest: BookingSession["guest"]) => void;
  
  addToCart: () => void;
  removeFromCart: (index: number) => void;
  editSession: (index: number) => void;
  
  clearSession: () => void;
  clearCart: () => void;
  
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      cart: [],

      startSession: (movie, showtimeId, startTime, price) => {
        set((state) => {
          // If starting a new session for a different showtime, wipe the old one
          // If same showtime, keep it (allows user to come back later)
          if (state.currentSession?.showtimeId === showtimeId) return state;
          
          return {
            currentSession: {
              movie,
              showtimeId,
              startTime,
              price,
              seats: [],
              concessions: [],
              guest: { name: "", email: "", phone: "" },
            },
          };
        });
      },

      updateSeats: (seats) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: { ...state.currentSession, seats },
          };
        });
      },

      updateConcessions: (concessions) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: { ...state.currentSession, concessions },
          };
        });
      },

      updateGuestDetails: (guest) => {
        set((state) => {
          if (!state.currentSession) return state;
          // Apply guest details to ALL cart items too, for convenience if they book multiple
          // Or just keep it loosely coupled. Let's apply to current session.
          
          // Also update all items in cart? Typically guest contact is for the whole order.
          // Let's decide: guest details are global for the checkout.
          // BUT, looking at the interface, `guest` is inside `BookingSession`.
          // For now, let's keep it on the session, and when checking out we use the first valid one or a global one.
          // Actually, let's just update currentSession.
          return {
            currentSession: { ...state.currentSession, guest },
          };
        });
      },
      
      addToCart: () => {
         set((state) => {
            if (!state.currentSession) return state;
            
            // Validate if session has seats or food? 
            // Minimally must have seats OR food.
            const hasItems = state.currentSession.seats.length > 0 || state.currentSession.concessions.length > 0;
            if (!hasItems) return state;

            return {
                cart: [...state.cart, state.currentSession],
                currentSession: null // Clear current helper session
            };
         });
      },

      removeFromCart: (index) => {
          set((state) => ({
              cart: state.cart.filter((_, i) => i !== index)
          }));
      },

      clearSession: () => set({ currentSession: null }),
      
      clearCart: () => set({ cart: [], currentSession: null }),

      editSession: (index) => {
        set((state) => {
           const itemToEdit = state.cart[index];
           if (!itemToEdit) return state;
           
           // If there is already a current session, we should probably push it to cart first?
           // For simplicity, let's assume we swap them or just overwrite (user intention is to edit this one).
           // Safe bet: Push current session to cart if it's valid, then edit the target.
           let newCart = state.cart.filter((_, i) => i !== index);
           
           if (state.currentSession && (state.currentSession.seats.length > 0 || state.currentSession.concessions.length > 0)) {
               newCart = [...newCart, state.currentSession];
           }

           return {
               cart: newCart,
               currentSession: itemToEdit
           };
        });
      },

      getTotal: () => {
        const { cart } = get();
        // Sum of all items in cart
        return cart.reduce((total, session) => {
             const seatsTotal = session.seats.length * session.price;
             const concessionsTotal = session.concessions.reduce(
               (acc, item) => acc + item.price * item.quantity,
               0
             );
             return total + seatsTotal + concessionsTotal;
        }, 0);
      },
    }),
    {
      name: "booking-session-storage",
    }
  )
);
