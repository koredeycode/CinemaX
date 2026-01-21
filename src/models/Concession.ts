import mongoose, { Document, Model, Schema } from "mongoose";

export interface IConcession extends Document {
  id: string;
  name: string;
  price: number;
  emoji: string;
  category: string;
}

const ConcessionSchema = new Schema<IConcession>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    emoji: { type: String, required: true },
    category: { type: String, required: true, default: "snack" },
  },
  { timestamps: true }
);

// Prevent model overwrite
const Concession: Model<IConcession> =
  mongoose.models.Concession || mongoose.model("Concession", ConcessionSchema);

export default Concession;
