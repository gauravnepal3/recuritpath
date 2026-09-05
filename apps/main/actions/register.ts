"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { RegisterSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";
import { headers } from "next/headers";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  try {

  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = validatedFields.data;

  // Signup is unauthenticated and sends an email per call — cap it per IP.
  const ip = clientIp(await headers());
  const limited = await rateLimit({ key: `register:ip:${ip}`, limit: 5, windowSeconds: 3600 });
  if (!limited.ok) {
    return { error: "Too many sign-up attempts. Please try again later." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const verificationToken = await generateVerificationToken(email);

  await sendVerificationEmail(
    verificationToken.email,
    verificationToken.token,
  );

  return { success: "Confirmation email sent!" };
  } catch (error) {
    console.error("Error in register function:", error);
    return { error: "An error occurred during registration." };
  }
};
