import mongoose, { Document, Model } from "mongoose";
import { User } from "../types";
export interface UserDocument extends Omit<User, "id">, Document {
    _id: mongoose.Types.ObjectId;
}
export declare const UserModel: Model<UserDocument>;
//# sourceMappingURL=User.d.ts.map