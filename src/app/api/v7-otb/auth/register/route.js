import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { apiError, apiSuccess } from "@/lib/api-response";
import { sendVerificationEmail } from "@/lib/mailer";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request) {
  try {
    const body = await request.json();
    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Invalid input";
      return apiError(firstError, 400);
    }

    const { name, email, password } = parseResult.data;

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return apiError("An account with this email address already exists.", 409);
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create verification token (expires in 24 hours)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email
    const emailResult = await sendVerificationEmail({
      email,
      name,
      token: verificationToken,
    });

    return apiSuccess(
      {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          isVerified: newUser.isVerified,
        },
        verifyUrl: emailResult?.verifyUrl,
        verificationToken: verificationToken, // Returned for convenient local testing
      },
      "Registration successful! Please check your email to verify your account before logging in.",
      201
    );
  } catch (error) {
    console.error("Register error:", error);
    if (error.name === "MongooseServerSelectionError" || error.message?.includes("ECONNREFUSED")) {
      return apiError(
        "Database connection error. Please ensure MongoDB is running or configure MONGODB_URI in .env.local.",
        503
      );
    }
    return apiError(error.message || "An unexpected error occurred during registration.", 500);
  }
}
