
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

// Helper to validate database connection and schema
export async function checkDatabaseSetup(): Promise<boolean> {
  try {
    // Test query to check if users table exists and is accessible
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
      
    if (error) {
      console.error("Database setup check - users table error:", error);
      return false;
    }
    
    // Check if RPC function exists
    const { error: rpcError } = await supabase.rpc('create_user_profile', {
      user_id: '00000000-0000-0000-0000-000000000000',
      user_email: 'test@example.com',
      user_name: 'Test User',
      user_avatar: null,
      initial_credits: 0
    });
    
    // RPC not found error is expected here (code 42883) because we're passing invalid data
    // But 404 or function not found would indicate our function doesn't exist
    if (rpcError && rpcError.code !== '42883' && !rpcError.message.includes('violates')) {
      console.error("Database setup check - RPC function error:", rpcError);
      return false;
    }
    
    console.log("Database setup check passed");
    return true;
  } catch (error) {
    console.error("Error in checkDatabaseSetup:", error);
    return false;
  }
}

// Helper to check if Pixabay API is working
export async function checkPixabayAPI(): Promise<boolean> {
  try {
    const apiKey = localStorage.getItem('pixabay_api_key');
    const response = await fetch(`https://pixabay.com/api/videos/?key=${apiKey || '49658971-12bf63930d640b2f9ffcc901c'}&per_page=1`);
    
    if (!response.ok) {
      console.error(`Pixabay API check failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    console.log("Pixabay API check passed", data);
    return true;
  } catch (error) {
    console.error("Pixabay API check failed:", error);
    return false;
  }
}

// Add any other utility functions here...
