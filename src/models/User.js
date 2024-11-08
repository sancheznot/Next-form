import { Schema, model, models } from "mongoose";
// import Wishlist from "./Wishlist"; if yo need it

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  phoneNumber: {
    type: String,
    match: [/^(\+?57)?([0-9]{10,12})$/, "Please add a valid phone number"],
  },
  accountStatus: {
    type: String,
    default: "active",
    enum: ["active", "suspended", "banned"], // Possible statuses
  },
  image: {
    type: String,
  },
  rol: {
    type: String,
    default: "user",
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Fields for managing tokens and sessions
  refreshToken: {
    type: String,
  },
  refreshTokenExpiration: {
    type: Date,
  },
});



const User = models?.User || model("User", UserSchema);
export default User;
