import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    firstName: {
      type: String,
      default: "",
    },

    lastName: {
      type: String,
      default: "",
    },

    age: Number,

    profileImage: {
      type: String,
      default: function () {
        // Generates a permanent unique initial badge using the user's username
        return `https://dicebear.com{encodeURIComponent(this.username || 'User')}`;
      },
    },

    role: {
      type: String,
      default: "USER",
      enum: ["USER", "ADMIN"],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
