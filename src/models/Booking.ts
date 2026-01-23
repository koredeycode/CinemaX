import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBooking extends Document {
  user?: mongoose.Types.ObjectId; // Optional if guest checkout
  userEmail: string; // REQUIRED: For associating bookings with users (guest or logged in)
  guestDetails?: {
    name: string;
    email: string;
    phone: string;
  };
  movie: mongoose.Types.ObjectId;
  date: string;
  time: string;
  seats: string[];
  foodDetails?: {
    id: string;
    name: string;
    qty: number;
    cost: number;
  }[];
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userEmail: { type: String, required: true, index: true }, // Indexed for fast lookup
    guestDetails: {
      name: String,
      email: String,
      phone: String,
    },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    seats: { type: [String], required: true },
    foodDetails: [
      {
        id: String,
        name: String,
        qty: Number,
        cost: Number,
      }
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentIntentId: { type: String },
  },
  { timestamps: true }
);

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
