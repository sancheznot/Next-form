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
  address: {
    type: String,
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
  // reviewsHistory: [
  //   {
  //     type: Schema.Types.ObjectId,
  //     ref: "Review",
  //   },
  // ],
  // wishList: {
  //   type: Schema.Types.ObjectId,
  //   ref: "WishList",
  // },
  // orders: [
  //   {
  //     type: Schema.Types.ObjectId,
  //     ref: "Order",
  //   },
  // ],
  // cart: {
  //   type: Schema.Types.ObjectId,
  //   ref: "Cart",
  // },
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

// Middleware to automatically create a wishlist if not present
// UserSchema.pre("save", async function (next) {
//   if (!this.wishList) {
//     try {
//       const newWishList = await Wishlist.create({
//         user: this._id,
//         products: [],
//       });
//       this.wishList = newWishList._id;
//     } catch (error) {
//       return next(error);
//     }
//   }
//   next();
// });

const User = models.User || model("User", UserSchema);
export default User;
