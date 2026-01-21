import mongoose, { Document, Model, Schema } from "mongoose";

export interface IComplaint extends Document {
  user: mongoose.Types.ObjectId;
  subject: string;
  message: string;
  status: "pending" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Complaint: Model<IComplaint> =
  mongoose.models.Complaint || mongoose.model<IComplaint>("Complaint", ComplaintSchema);

export default Complaint;
