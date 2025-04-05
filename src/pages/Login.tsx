
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { Google } from '@/components/icons';
import MobileNavBar from '@/components/MobileNavBar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Login = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingTimeout, setProcessingTimeout] = useState<NodeJS.Timeout | null>(null);

  const { login, signUp, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Clear any existing timeout on unmount
  useEffect(() => {
    return () => {
      if (processingTimeout) {
        clearTimeout(processingTimeout);
      }
    };
  }, [processingTimeout]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Set a timeout to show an error message if the login takes too long
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setError("Login is taking longer than expected. Please try again.");
    }, 15000); // 15 seconds timeout
    
    setProcessingTimeout(timeout);
    
    try {
      await login(loginEmail, loginPassword);
      if (processingTimeout) clearTimeout(processingTimeout);
      toast.success("Welcome back!");
      navigate('/');
    } catch (error: any) {
      if (processingTimeout) clearTimeout(processingTimeout);
      console.error("Login error:", error);
      let errorMessage = "Failed to login";
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "User not found";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    
    // Set a timeout to show an error message if the signup takes too long
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setError("Signup is taking longer than expected. Please try again.");
    }, 15000); // 15 seconds timeout
    
    setProcessingTimeout(timeout);
    
    try {
      await signUp(signupEmail, signupPassword);
      if (processingTimeout) clearTimeout(processingTimeout);
      toast.success("Account created successfully! You've received 50 credits.");
      navigate('/');
    } catch (error: any) {
      if (processingTimeout) clearTimeout(processingTimeout);
      console.error("Signup error:", error);
      let errorMessage = "Failed to create account";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email is already in use";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    // Set a timeout for Google login
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setError("Google login is taking longer than expected. Please try again.");
    }, 20000); // 20 seconds timeout
    
    setProcessingTimeout(timeout);
    
    try {
      await loginWithGoogle();
      if (processingTimeout) clearTimeout(processingTimeout);
      toast.success("Logged in with Google!");
      navigate('/');
    } catch (error: any) {
      if (processingTimeout) clearTimeout(processingTimeout);
      console.error("Google login error:", error);
      setError(error.message || "Failed to login with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await resetPassword(resetEmail);
      toast.success("Password reset email sent! Check your inbox.");
      setShowResetForm(false);
    } catch (error: any) {
      console.error(error);
      let errorMessage = "Failed to send password reset email";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>
              Sign in to download videos and earn credits
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {showResetForm ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Input 
                    id="reset-email" 
                    placeholder="Email" 
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Send Reset Email"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => {
                    setShowResetForm(false);
                    setError(null);
                  }}
                >
                  Back to Login
                </Button>
              </form>
            ) : (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="pt-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Input 
                        id="login-email" 
                        placeholder="Email" 
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Input 
                        id="login-password"
                        placeholder="Password" 
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="link" 
                      className="p-0 h-auto text-sm"
                      onClick={() => {
                        setShowResetForm(true);
                        setError(null);
                      }}
                      disabled={isLoading}
                    >
                      Forgot password?
                    </Button>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Processing..." : "Login"}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup" className="pt-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Input 
                        id="signup-email" 
                        placeholder="Email" 
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Input 
                        id="signup-password"
                        placeholder="Password" 
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={6}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Input 
                        id="signup-confirm-password"
                        placeholder="Confirm Password" 
                        type="password"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Processing..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <Google className="mr-2 h-4 w-4" /> Google
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-center w-full text-muted-foreground">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </div>
      <MobileNavBar />
    </div>
  );
};

export default Login;
