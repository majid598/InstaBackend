import mongoose, { model } from "mongoose";

const schema = mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model for the first user
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model for the second user
      required: true,
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.models.Chat || model("Chat", schema);
