// app/api/auth/2fa/verify/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token, isBackupCode } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    await connectMongoDB();

    const user = await User.findOne({
      email: session.user.email,
    }).select("+twoFactorSecret +backupCodes");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let isValid = false;

    if (isBackupCode) {
      isValid = await user.verifyBackupCode(token);
    } else {
      isValid = user.verify2FAToken(token);
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification successful",
    });
  } catch (error) {
    console.error("2FA verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
