import { connectMongoDB } from "@/infrastructure/database/mongodb";
import User from "@/infrastructure/database/models/User";
import bcrypt from "bcryptjs";

export const MongoDBAdapter = {
  async getUserByEmail(email) {
    await connectMongoDB();
    return await User.findOne({ email });
  },

  async createUserFromOAuth(profile) {
    await connectMongoDB();
    const userpassword = profile.given_name + Math.floor(Math.random() * 1000000000);
    const salt = await bcrypt.genSalt(12);
    const passwordEncrypted = await bcrypt.hash(userpassword, salt);

    return await User.create({
      email: profile.email,
      name: profile.given_name || profile.name.split(" ")[0],
      lastname: profile.family_name || profile.name.split(" ")[1] || "",
      password: passwordEncrypted,
      image: profile.picture || "https://upload.wikimedia.org/wikipedia/commons/5/50/User_icon-cp.svg",
      accountStatus: "active",
      rol: "user",
      isAdmin: false,
    });
  },

  async verifyCredentials(credentials) {
    await connectMongoDB();
    return await User.findOne({ email: credentials.email }).select("+password +twoFactorEnabled");
  }
};