// app/api/auth/2fa/setup/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectMongoDB } from "@/infrastructure/database/mongodb";
import User from "@/infrastructure/database/models/User";
import QRCode from "qrcode";
import { authenticator } from 'otplib';
import crypto from 'crypto';

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

    // Generate 2FA secret
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.email,
      'Your App Name',
      secret
    );
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    // Generate backup codes
    const backupCodes = Array(10).fill(null).map(() => ({
      code: crypto.randomBytes(4).toString('hex').toUpperCase(),
      used: false
    }));

    // Log for verification
    // console.log('Generated backup codes:', backupCodes);

    // Save everything
    user.twoFactorSecret = secret;
    user.backupCodes = backupCodes;
    await user.save();

    // Verify saved data
    const savedUser = await User.findOne({ email: user.email })
      .select('+twoFactorSecret +backupCodes');
    // console.log('Saved backup codes:', savedUser.backupCodes);

    return NextResponse.json({ 
      secret,
      qrCode,
      backupCodes: backupCodes.map(bc => bc.code)
    });
  } catch (error) {
    console.error("2FA Setup Error:", error);
    return NextResponse.json(
      { error: "Failed to setup 2FA" }, 
      { status: 500 }
    );
  }
}