"use server";

import * as z from "zod";

import { db } from "@/lib/db";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import {
  sendVerificationEmail,
  sendTwoFactorTokenEmail,
} from "@/lib/mail";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import {
  generateVerificationToken,
  generateTwoFactorToken
} from "@/lib/tokens";
import {
  getTwoFactorConfirmationByUserId
} from "@/data/two-factor-confirmation";
import { headers } from "next/headers";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** next/navigation throws to perform a redirect; those must never be caught. */
function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null,
) => {
  try {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, code } = validatedFields.data;

  // Throttle per-IP and per-account so credential stuffing cannot run
  // unbounded against the login form.
  const ip = clientIp(await headers());
  const [byIp, byAccount] = await Promise.all([
    rateLimit({ key: `login:ip:${ip}`, limit: 20, windowSeconds: 300 }),
    rateLimit({ key: `login:email:${email.toLowerCase()}`, limit: 10, windowSeconds: 300 }),
  ]);
  if (!byIp.ok || !byAccount.ok) {
    return { error: "Too many attempts. Please try again in a few minutes." };
  }

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email does not exist!" }
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email,
    );

    try {
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
      );
    } catch (error) {
      console.error("Verification email failed to send for", existingUser.email, error);
      return {
        error:
          "We could not send your confirmation email just now. Please try again in a few minutes.",
      };
    }

    return { success: "Confirmation email sent!" };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(
        existingUser.email
      );

      if (!twoFactorToken) {
        return { error: "Invalid code!" };
      }

      if (twoFactorToken.token !== code) {
        return { error: "Invalid code!" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return { error: "Code expired!" };
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id }
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      );

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id }
        });
      }

      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        }
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email)
      try {
        await sendTwoFactorTokenEmail(
          twoFactorToken.email,
          twoFactorToken.token,
        );
      } catch (error) {
        // Returning twoFactor:true here would strand the user on a code prompt
        // for a code that was never delivered.
        console.error("2FA email failed to send for", existingUser.email, error);
        return { error: "We could not send your verification code. Please try again shortly." };
      }

      return { twoFactor: true };
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    // Anything else — including the NEXT_REDIRECT that signIn throws on
    // SUCCESS — must propagate untouched.
    throw error;
  }
  } catch (error) {
    // next/navigation signals redirects by throwing. Swallowing that here
    // turned every successful login into "An error occurred during login."
    // and left the user sitting on the login page.
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Error in login function:", error);
    return { error: "An error occurred during login." };
  }
};
