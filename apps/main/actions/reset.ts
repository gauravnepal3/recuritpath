"use server";

import * as z from "zod";

import { ResetSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { sendPasswordResetEmail } from "@/lib/mail";
import { generatePasswordResetToken } from "@/lib/tokens";
import { headers } from "next/headers";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid emaiL!" };
  }

  const { email } = validatedFields.data;

  const ip = clientIp(await headers());
  const [byIp, byAccount] = await Promise.all([
    rateLimit({ key: `reset:ip:${ip}`, limit: 10, windowSeconds: 3600 }),
    rateLimit({ key: `reset:email:${email.toLowerCase()}`, limit: 5, windowSeconds: 3600 }),
  ]);
  if (!byIp.ok || !byAccount.ok) {
    return { error: "Too many reset requests. Please try again later." };
  }

  const existingUser = await getUserByEmail(email);

  // Always report success: a distinct "Email not found!" turns this form into
  // an account-enumeration oracle.
  if (existingUser) {
    try {
      const passwordResetToken = await generatePasswordResetToken(email);
      await sendPasswordResetEmail(
        passwordResetToken.email,
        passwordResetToken.token,
      );
    } catch (error) {
      // Swallow deliberately: the response must not differ based on whether
      // the address exists, and that includes failure modes.
      console.error("Password reset email failed to send:", error);
    }
  }

  return { success: "If that email has an account, a reset link is on its way." };
}