import mongoose, { Schema, Document, Model } from "mongoose";
import { Message } from "../types";

export interface MessageDocument extends Omit<Message, "id">, Document {
  _id: mongoose.Types.ObjectId;
}

const MessageSchema = new Schema<MessageDocument>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    receiverId: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: false,
    toJSON: {
      transform: function (doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for efficient querying of messages between users
MessageSchema.index({ senderId: 1, receiverId: 1, timestamp: 1 });
MessageSchema.index({ receiverId: 1, senderId: 1, timestamp: 1 });

export const MessageModel: Model<MessageDocument> =
  mongoose.models.Message ||
  mongoose.model<MessageDocument>("Message", MessageSchema);

