// app/api/auth/2fa/setup/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import QRCode from "qrcode";
import { authenticator } from "otplib";
import crypto from "crypto";

export async function GET(req) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate new secret
    const secret = authenticator.generateSecret();

    // Create OTPAuth URL
    const otpauthUrl = authenticator.keyuri(
      user.email,
      "Your App Name",
      secret
    );

    // Generate QR code
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    // Generate backup codes with proper structure
    const backupCodes = Array(10)
      .fill(null)
      .map(() => ({
        code: crypto.randomBytes(4).toString("hex").toUpperCase(),
        used: false,
      }));

    // Save everything to user
    user.twoFactorSecret = secret;
    user.backupCodes = backupCodes;

    await user.save();

    console.log(
      "Generated backup codes:",
      backupCodes.map((bc) => bc.code)
    );

    return NextResponse.json({
      secret,
      qrCode,
      backupCodes: backupCodes.map((bc) => bc.code), // Solo enviar los códigos
      email: user.email,
    });
  } catch (error) {
    console.error("2FA Setup Error:", error);
    return NextResponse.json({ error: "Failed to setup 2FA" }, { status: 500 });
  }
}
