import { IMovie } from "@/models/Movie";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BookingSession {
  movie: IMovie | null;
  movieId: string | null;
  date: string | null;
  time: string | null;
  // showtimeId: string | null; // REMOVED
  // startTime: string | null; // REMOVED
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
  expiresAt: number | null; // Timestamp when reservation expires
}

interface CartState {
  currentSession: BookingSession | null;
  cart: BookingSession[];
  
  startSession: (movie: IMovie, date: string, time: string, price: number) => void;
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

      startSession: (movie, date, time, price) => {
        set((state) => {
          const movieId = String(movie._id);
          
          // Check if we already have this session in cart
          const existingInCart = state.cart.find(
            s => String(s.movieId) === movieId && s.date === date && s.time === time
          );
          
          console.log("startSession - Existing Check:", { movieId, date, time, found: !!existingInCart });

          if (existingInCart) {
             console.log("startSession - Loading existing session:", existingInCart);
             return {
                 currentSession: { ...existingInCart }
             };
          }

          // If starting a new session for a different slot, wipe the old one
          if (String(state.currentSession?.movieId) === movieId && 
              state.currentSession?.date === date && 
              state.currentSession?.time === time) {
              return state;
          }
          
          return {
            currentSession: {
              movie,
              movieId,
              date,
              time,
              price,
              seats: [],
              concessions: [],
              guest: { name: "", email: "", phone: "" },
              expiresAt: null
            },
          };
        });
      },

      updateSeats: (seats) => {
        set((state) => {
          if (!state.currentSession) return state;
          
          // Logic for timer:
          // 1. If we have seats and NO expiry, start timer (5 mins)
          // 2. If seats kept, keep expiry
          // 3. If seats cleared, clear expiry
          
          let newExpiry = state.currentSession.expiresAt;
          
          if (seats.length > 0 && !newExpiry) {
              newExpiry = Date.now() + (5 * 60 * 1000); // 5 minutes from now
          } else if (seats.length === 0) {
              newExpiry = null;
          }

          return {
            currentSession: { 
                ...state.currentSession, 
                seats,
                expiresAt: newExpiry
            },
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
          return {
            currentSession: { ...state.currentSession, guest },
          };
        });
      },
      
      addToCart: () => {
         set((state) => {
            if (!state.currentSession) return state;
            
            // Validate if session has seats or food? 
            const hasItems = state.currentSession.seats.length > 0 || state.currentSession.concessions.length > 0;
            
            const existingIndex = state.cart.findIndex(
                s => String(s.movieId) === String(state.currentSession!.movieId) && 
                     s.date === state.currentSession!.date && 
                     s.time === state.currentSession!.time
            );

            console.log("addToCart - Merge Check:", { 
                currentId: state.currentSession?.movieId,
                existingIndex,
                hasItems 
            });

            let newCart = [...state.cart];

            if (existingIndex !== -1) {
                if (hasItems) {
                    // Update existing
                    newCart[existingIndex] = state.currentSession;
                } else {
                    // Remove existing if empty (user deselected everything)
                    newCart.splice(existingIndex, 1);
                }
            } else {
                if (hasItems) {
                    // Add new
                    newCart.push(state.currentSession);
                }
                // If !hasItems and !existing, do nothing (don't add empty)
            }

            return {
                cart: newCart,
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
