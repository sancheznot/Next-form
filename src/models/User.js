// src/models/User.js
import { Schema, model, models } from "mongoose";
import { authenticator } from "otplib";
import crypto from "crypto";

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
    enum: ["active", "suspended", "banned"],
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
  twoFactorEnabled: {
    type: Boolean,
    default: false,
    select: false,
  },
  twoFactorSecret: {
    type: String,
    select: false,
  },
  backupCodes: [
    {
      code: {
        type: String,
        select: false,
      },
      used: {
        type: Boolean,
        default: false,
      },
    },
  ],
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to generate new 2FA secret
UserSchema.methods.generate2FASecret = function () {
  const secret = authenticator.generateSecret();
  this.twoFactorSecret = secret;
  return secret;
};

// Method to verify 2FA token
UserSchema.methods.verify2FAToken = function (token) {
  return authenticator.verify({
    token,
    secret: this.twoFactorSecret,
  });
};

// Generate backup codes
UserSchema.methods.generateBackupCodes = function () {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push({
      code: crypto.randomBytes(4).toString("hex").toUpperCase(),
      used: false,
    });
  }
  this.backupCodes = codes;
  return codes.map((c) => c.code);
};

// Verify backup code
UserSchema.methods.verifyBackupCode = async function (code) {
  const backupCode = this.backupCodes.find(
    (bc) => !bc.used && bc.code === code
  );
  if (backupCode) {
    backupCode.used = true;
    await this.save();
    return true;
  }
  return false;
};

// Pre-save hook to ensure backup codes are generated when 2FA is enabled
UserSchema.pre("save", function (next) {
  if (
    this.isModified("twoFactorEnabled") &&
    this.twoFactorEnabled &&
    (!this.backupCodes || this.backupCodes.length === 0)
  ) {
    this.generateBackupCodes();
  }
  next();
});

const User = models?.User || model("User", UserSchema);
export default User;
