import mongoose from "mongoose";

const VoyageLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Photo title/name is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [150, "Location cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    photoUrl: {
      type: String,
      required: [true, "Photo image is required"],
    },
    photoPublicId: {
      type: String,
      default: null,
    },
    wander_brief: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Register model with exact name: voyage_log
const VoyageLog =
  mongoose.models.voyage_log || mongoose.model("voyage_log", VoyageLogSchema, "voyage_logs");

export default VoyageLog;
