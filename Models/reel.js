import mongoose, { model } from "mongoose";

const schema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      required: true,
    },
    attachMent: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    favorites:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    viewsByUser: {
      type: [String], // Array of user IDs
      default: [],
    },
    comments: [
      {
        comment: {
          type: String,
          required: true,
        },
        user: {
          _id: String,
          username: String,
          profile: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    share: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Reel = mongoose.models.Reel || model("Reel", schema);
