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
  },
  { timestamps: true }
);

const Movie: Model<IMovie> =
  mongoose.models.Movie || mongoose.model<IMovie>("Movie", MovieSchema);

export default Movie;
