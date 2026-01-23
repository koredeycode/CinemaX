import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMovie extends Document {
  title: string;
  slug: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  runtime: number; // in minutes
  rating: string;
  genres: string[];
  status: "now_showing" | "coming_soon" | "not_showing";
  price: number;
  schedule: {
    date: string;
    times: string[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MovieSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    posterUrl: { type: String, required: true },
    backdropUrl: { type: String, required: true },
    trailerUrl: { type: String, required: true },
    runtime: { type: Number, required: true },
    rating: { type: String, required: true },
    genres: { type: [String], required: true },
    status: {
      type: String,
      enum: ["now_showing", "coming_soon", "not_showing"],
      default: "coming_soon",
    },
    price: { type: Number, default: 4500 }, // Default ticket price
    schedule: [{
      date: { type: String, required: true }, // YYYY-MM-DD
      times: { type: [String], required: true } // ["14:00", "19:00"]
    }],
  },
  { timestamps: true }
);

const Movie: Model<IMovie> =
  mongoose.models.Movie || mongoose.model<IMovie>("Movie", MovieSchema);

export default Movie;
