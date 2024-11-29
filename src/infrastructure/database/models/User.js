const { Schema, model } = require('mongoose');
import { authenticator } from "otplib";
import crypto from "crypto";

/**
 * User Schema Definition
 * Includes basic user info, authentication, and 2FA support
 */
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
  // 2FA Configuration
  twoFactorEnabled: {
    type: Boolean,
    default: false,
    select: false,
  },
  twoFactorSecret: {
    type: String,
    select: false,
  },
  // Backup Codes Configuration
  backupCodes: [{
    code: {
      type: String,
      required: true,
      select: false
    },
    used: {
      type: Boolean,
      default: false
    }
  }],
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Generate and set a new 2FA secret for the user
 * @returns {string} The generated secret
 */
UserSchema.methods.generate2FASecret = function() {
  const secret = authenticator.generateSecret();
  this.twoFactorSecret = secret;
  return secret;
};

/**
 * Verify a 2FA token against the user's secret
 * @param {string} token - The token to verify
 * @returns {boolean} Whether the token is valid
 */
UserSchema.methods.verify2FAToken = function(token) {
  return authenticator.verify({
    token,
    secret: this.twoFactorSecret,
  });
};

/**
 * Generate new backup codes for the user
 * @returns {string[]} Array of generated backup codes
 */
UserSchema.methods.generateBackupCodes = function() {
  // Generate 10 backup codes
  const codes = Array(10).fill(null).map(() => ({
    code: crypto.randomBytes(4).toString("hex").toUpperCase(),
    used: false
  }));
  
  // Save to user
  this.backupCodes = codes;
  
  // Log for debugging
  console.log("Generated backup codes:", codes.map(c => c.code));
  
  // Return only the codes
  return codes.map(c => c.code);
};

/**
 * Verify a backup code and mark it as used if valid
 * @param {string} code - The backup code to verify
 * @returns {Promise<boolean>} Whether the code was valid and used
 */
UserSchema.methods.verifyBackupCode = async function(code) {
  console.log("Verifying backup code:", code);
  console.log("Available codes:", this.backupCodes);

  // Find unused matching code
  const backupCode = this.backupCodes.find(bc => 
    !bc.used && bc.code === code.toUpperCase()
  );

  if (backupCode) {
    console.log("Valid backup code found");
    backupCode.used = true;
    await this.save();
    return true;
  }

  console.log("No valid backup code found");
  return false;
};

/**
 * Pre-save hook to ensure backup codes exist when 2FA is enabled
 */
UserSchema.pre("save", function(next) {
  if (
    this.isModified("twoFactorEnabled") && 
    this.twoFactorEnabled && 
    (!this.backupCodes || this.backupCodes.length === 0)
  ) {
    this.generateBackupCodes();
  }
  next();
});

// Create or use existing model
const User = models?.User || model("User", UserSchema);
export default User;
