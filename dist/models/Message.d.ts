import mongoose, { Document, Model } from "mongoose";
import { Message } from "../types";
export interface MessageDocument extends Omit<Message, "id">, Document {
    _id: mongoose.Types.ObjectId;
}
export declare const MessageModel: Model<MessageDocument>;
//# sourceMappingURL=Message.d.ts.map