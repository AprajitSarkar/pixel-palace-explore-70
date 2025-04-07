
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from '@/lib/supabase';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to check if email is verified
export async function isEmailVerified(email: string): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getUser();
    return !!data.user?.email_confirmed_at;
  } catch (error) {
    console.error("Error checking email verification:", error);
    return false;
  }
}

// Add any other utility functions here...
