// app/api/auth/2fa/enable/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectMongoDB } from "@/infrastructure/database/mongodb";
import User from "@/infrastructure/database/models/User";

export async function POST(req) {
  try {
    const session = await auth();
    console.log("Session in enable route:", session); // Debug log

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { token } = body;
    console.log("Received token:", token); // Debug log

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    await connectMongoDB();
    const user = await User.findOne({ email: session.user.email }).select(
      "+twoFactorSecret"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Found user:", user.email); // Debug log

    // Verify the token
    const isValid = user.verify2FAToken(token);
    console.log("Token validation result:", isValid); // Debug log

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();
    console.log("2FA enabled for user:", user.email); // Debug log

    return NextResponse.json({
      success: true,
      message: "2FA has been enabled successfully",
    });
  } catch (error) {
    console.error("2FA Enable Error:", error);
    return NextResponse.json(
      { error: "Failed to enable 2FA" },
      { status: 500 }
    );
  }
}
