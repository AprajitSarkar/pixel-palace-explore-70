
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, storage, googleProvider } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
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
  const { toast: uiToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          } else {
            // Create new user profile with initial 50 credits
            const newUser: UserData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              credits: 50 // New users get 50 credits
            };
            
            try {
              await setDoc(userRef, {
                ...newUser,
                createdAt: serverTimestamp()
              });
              
              setUserData(newUser);
              toast("Welcome!", {
                description: "You've received 50 credits as a new user!",
              });
            } catch (error) {
              console.error("Error creating user document:", error);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document with initial credits
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: null,
        photoURL: null,
        credits: 50, // New users get 50 credits
        createdAt: serverTimestamp()
      });
      
      return;
    } catch (error: any) {
      console.error("Error during sign up:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Error during Google login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Error sending reset password email:", error);
      throw error;
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!currentUser) throw new Error("No authenticated user");
    try {
      await updatePassword(currentUser, newPassword);
    } catch (error: any) {
      console.error("Error changing password:", error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!currentUser) throw new Error("No authenticated user");
    
    try {
      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', currentUser.uid));
      
      // Delete auth user
      await deleteUser(currentUser);
    } catch (error: any) {
      console.error("Error deleting account:", error);
      throw error;
    }
  };

  const updateUserCredits = async (amount: number) => {
    if (!currentUser || !userData) throw new Error("No authenticated user");
    
    const newCredits = userData.credits + amount;
    
    try {
      // Update credits in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { credits: newCredits }, { merge: true });
      
      // Update local state
      setUserData({
        ...userData,
        credits: newCredits
      });
    } catch (error: any) {
      console.error("Error updating user credits:", error);
      throw error;
    }
    
    // Return void to match the interface
    return;
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
    updateUserCredits
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
