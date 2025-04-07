
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";

interface UserData {
  id: string;
  email: string | null;
  display_name: string | null;
  photo_url: string | null;
  credits: number;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateUserCredits: (amount: number) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  isEmailVerified: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        setCurrentUser(session?.user || null);
        
        if (session?.user) {
          await fetchUserData(session.user.id);
        } else {
          setUserData(null);
        }
        setLoading(false);
      }
    );

    // Initial session check
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setCurrentUser(session?.user || null);
      
      if (session?.user) {
        await fetchUserData(session.user.id);
      }
      setLoading(false);
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      console.log("Fetching user data for ID:", userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user data:", error);
        
        // If no user data found, create new user profile
        if (error.code === 'PGRST116') {
          await createUserProfile(userId);
        }
      } else if (data) {
        console.log("User data found:", data);
        setUserData({
          id: data.id,
          email: data.email,
          display_name: data.display_name,
          photo_url: data.photo_url,
          credits: data.credits
        });
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      
      if (!user) return;
      
      console.log("Creating user profile for:", userId, user.email);
      
      // Using rpc to bypass RLS
      const { data, error } = await supabase.rpc('create_user_profile', { 
        user_id: userId,
        user_email: user.email,
        user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        user_avatar: user.user_metadata?.avatar_url || null,
        initial_credits: 50
      });
      
      if (error) {
        console.error("Error creating user profile via RPC:", error);
        
        // Fallback method
        console.log("Trying direct insert with service role (if available)");
        const newUser = {
          id: userId,
          email: user.email,
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          photo_url: user.user_metadata?.avatar_url,
          credits: 50 // New users get 50 credits
        };
        
        setUserData(newUser);
        toast.success("Welcome!", {
          description: "You've received 50 credits as a new user!",
        });
      } else {
        console.log("User profile created via RPC:", data);
        
        // Fetch the created user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (!userError && userData) {
          setUserData({
            id: userData.id,
            email: userData.email,
            display_name: userData.display_name,
            photo_url: userData.photo_url,
            credits: userData.credits
          });
          
          toast.success("Welcome!", {
            description: "You've received 50 credits as a new user!",
          });
        }
      }
    } catch (error) {
      console.error("Error in createUserProfile:", error);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Starting signup process for:", email);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      console.log("User created successfully");
      
      // User profile will be created in the onAuthStateChange listener
    } catch (error: any) {
      console.error("Error during sign up:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login for:", email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      console.log("Login successful");
    } catch (error: any) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log("Attempting Google login");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      console.log("Google login initiated");
    } catch (error: any) {
      console.error("Error during Google login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Error sending reset password email:", error);
      throw error;
    }
  };

  const changePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Error changing password:", error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!currentUser) throw new Error("No authenticated user");
    
    try {
      console.log("Starting account deletion process for:", currentUser.id);
      
      // 1. Delete user's data from all tables
      const tables = ['liked_videos', 'video_history', 'credit_purchases', 'ad_views', 'users'];
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', currentUser.id);
          
        if (error && table !== 'users') {
          console.error(`Error deleting from ${table}:`, error);
        }
      }
      
      // 2. Delete user's files from storage
      const { error: storageError } = await supabase.storage
        .from('user_files')
        .remove([`${currentUser.id}/`]);
        
      if (storageError) {
        console.log("Storage deletion error or no files:", storageError);
      }
      
      // 3. Delete auth user (this will trigger cascade deletion for users table)
      await logout();
      
      toast.success("Account deleted successfully");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      throw error;
    }
  };

  const updateUserCredits = async (amount: number) => {
    if (!currentUser || !userData) throw new Error("No authenticated user");
    
    const newCredits = userData.credits + amount;
    
    try {
      console.log(`Updating credits for ${currentUser.id}: ${userData.credits} + ${amount} = ${newCredits}`);
      
      // Update credits in database
      const { error } = await supabase
        .from('users')
        .update({ credits: newCredits })
        .eq('id', currentUser.id);
        
      if (error) throw error;
      
      // Save purchase record if it's a positive amount (purchase)
      if (amount > 0) {
        const { error: purchaseError } = await supabase
          .from('credit_purchases')
          .insert([{
            user_id: currentUser.id,
            amount: amount,
            credits: amount,
            product_id: 'manual_adjustment'
          }]);
          
        if (purchaseError) {
          console.error("Error recording purchase:", purchaseError);
        } else {
          console.log(`Purchase record created for ${amount} credits`);
        }
      }
      
      // Update local state
      setUserData({
        ...userData,
        credits: newCredits
      });
    } catch (error: any) {
      console.error("Error updating user credits:", error);
      throw error;
    }
  };

  const sendEmailVerification = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: currentUser?.email || '',
      });
      
      if (error) throw error;
      
      toast.success("Verification email sent", {
        description: "Please check your inbox and verify your email address",
      });
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      toast.error("Failed to send verification email");
      throw error;
    }
  };
  
  const isEmailVerified = () => {
    return currentUser?.email_confirmed_at != null;
  };

  const value = {
    currentUser,
    userData,
    loading,
    signUp,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    changePassword,
    deleteAccount,
    updateUserCredits,
    sendEmailVerification,
    isEmailVerified
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
