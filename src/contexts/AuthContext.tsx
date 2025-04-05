
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
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? `User ${user.uid} logged in` : "No user");
      setCurrentUser(user);
      
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            console.log("User document exists in Firestore:", docSnap.data());
            setUserData(docSnap.data() as UserData);
          } else {
            console.log("Creating new user document for:", user.uid);
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
              
              console.log("New user document created successfully");
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
      console.log("Starting signup process for:", email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created successfully:", userCredential.user.uid);
      
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
      
      console.log("User document created in Firestore");
      return;
    } catch (error: any) {
      console.error("Error during sign up:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login for:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful for:", userCredential.user.uid);
    } catch (error: any) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log("Attempting Google login");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google login successful for:", result.user.uid);
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
      console.log("Starting account deletion process for:", currentUser.uid);
      
      // 1. Delete user's likes
      const likesRef = collection(db, 'likes');
      const likesQuery = query(likesRef, where("userId", "==", currentUser.uid));
      const likesSnapshot = await getDocs(likesQuery);
      
      const likesDeletePromises = likesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(likesDeletePromises);
      console.log(`${likesSnapshot.docs.length} likes deleted`);
      
      // 2. Delete user's history
      const historyRef = collection(db, 'history');
      const historyQuery = query(historyRef, where("userId", "==", currentUser.uid));
      const historySnapshot = await getDocs(historyQuery);
      
      const historyDeletePromises = historySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(historyDeletePromises);
      console.log(`${historySnapshot.docs.length} history records deleted`);
      
      // 3. Delete user's storage files
      const storageRef = ref(storage, `users/${currentUser.uid}`);
      try {
        const filesList = await listAll(storageRef);
        const deletePromises = filesList.items.map(item => deleteObject(item));
        await Promise.all(deletePromises);
        console.log(`${filesList.items.length} storage files deleted`);
      } catch (error) {
        console.log("No files to delete or storage error:", error);
      }
      
      // 4. Delete user data from Firestore
      await deleteDoc(doc(db, 'users', currentUser.uid));
      console.log("User document deleted from Firestore");
      
      // 5. Delete auth user
      await deleteUser(currentUser);
      console.log("User deleted from Firebase Auth");
      
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
      console.log(`Updating credits for ${currentUser.uid}: ${userData.credits} + ${amount} = ${newCredits}`);
      // Update credits in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { credits: newCredits }, { merge: true });
      
      // Save purchase record if it's a positive amount (purchase)
      if (amount > 0) {
        const purchaseRef = collection(db, 'users', currentUser.uid, 'purchases');
        await setDoc(doc(purchaseRef), {
          amount: amount,
          timestamp: serverTimestamp(),
          creditsBefore: userData.credits,
          creditsAfter: newCredits
        });
        console.log(`Purchase record created for ${amount} credits`);
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
