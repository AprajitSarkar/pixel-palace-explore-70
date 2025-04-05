
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
import { auth, db, googleProvider } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
            
            await setDoc(userRef, {
              ...newUser,
              createdAt: serverTimestamp()
            });
            
            setUserData(newUser);
            toast({
              title: "Welcome!",
              description: "You've received 50 credits as a new user!",
              variant: "default",
            });
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
  }, [toast]);

  const signUp = async (email: string, password: string) => {
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
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const changePassword = async (newPassword: string) => {
    if (!currentUser) throw new Error("No authenticated user");
    await updatePassword(currentUser, newPassword);
  };

  const deleteAccount = async () => {
    if (!currentUser) throw new Error("No authenticated user");
    
    // Delete user data from Firestore
    await deleteDoc(doc(db, 'users', currentUser.uid));
    
    // Delete auth user
    await deleteUser(currentUser);
  };

  const updateUserCredits = async (amount: number) => {
    if (!currentUser || !userData) throw new Error("No authenticated user");
    
    const newCredits = userData.credits + amount;
    
    // Update credits in Firestore
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, { credits: newCredits }, { merge: true });
    
    // Update local state
    setUserData({
      ...userData,
      credits: newCredits
    });
    
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
