import mongoose, { Document, Model, Schema } from "mongoose";

export interface IShowtime extends Document {
  movie: mongoose.Types.ObjectId;
  startTime: Date;
  price: number;
  seatMap: {
    rows: number;
    cols: number;
    unavailable: string[]; // Array of seat labels like 'A1', 'B2' that are permanently unavailable
  };
  bookedSeats: string[]; // Array of seat labels that are booked
  createdAt: Date;
  updatedAt: Date;
}

const ShowtimeSchema: Schema = new Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    startTime: { type: Date, required: true },
    price: { type: Number, required: true },
    seatMap: {
      rows: { type: Number, default: 10 },
      cols: { type: Number, default: 10 },
      unavailable: { type: [String], default: [] },
    },
    bookedSeats: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Showtime: Model<IShowtime> =
  mongoose.models.Showtime ||
  mongoose.model<IShowtime>("Showtime", ShowtimeSchema);

export default Showtime;
