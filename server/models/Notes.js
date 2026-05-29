import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    // Creating a one to many relation with users
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Please add a title."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description."],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Note", noteSchema);
