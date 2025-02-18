"use server";
import { cookies } from 'next/headers'
import { signOut } from "@/auth";

export const logout = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('organization')
  await signOut();
};
