import mongoose from "mongoose";

const { Schema } = mongoose;

const videoSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    videoId: {
      type: String,
      required: true,
      unique: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    extension: {
      type: String,
    },
    dimensions: {
      width: {
        type: Number,
      },
      height: {
        type: Number,
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    extractedAudio: {
      type: Boolean,
      default: false,
    },
    resizes: {
      type: Map,
      of: new mongoose.Schema(
        {
          processing: {
            type: Boolean,
            required: true,
          },
        },
        { _id: false },
      ),
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Video", videoSchema);
