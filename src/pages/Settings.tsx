
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/Header';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info, ExternalLink, User, Bell, LogOut, Trash2, AlertTriangle, Volume2, CreditCard } from "lucide-react";
import MobileNavBar from '@/components/MobileNavBar';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { Coins, Key } from '@/components/icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Settings = () => {
  const [customApiKey, setCustomApiKey] = useState<string>(
    localStorage.getItem('pixabay_api_key') || ""
  );
  const [autoPlayEnabled, setAutoPlayEnabled] = useState<boolean>(
    localStorage.getItem('autoplay_enabled') === 'true'
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    localStorage.getItem('sound_enabled') === 'true'
  );
  
  const { toast: uiToast } = useToast();
  const { currentUser, userData, logout, deleteAccount, sendEmailVerification, isEmailVerified } = useAuth();
  const navigate = useNavigate();

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (customApiKey.trim()) {
      localStorage.setItem('pixabay_api_key', customApiKey.trim());
      toast.success("API key saved successfully");
    } else {
      localStorage.removeItem('pixabay_api_key');
      toast.success("Using default API key");
    }
  };

  const handleResetApiKey = () => {
    localStorage.removeItem('pixabay_api_key');
    setCustomApiKey("");
    toast.info("Reset to default API key");
  };
  
  const toggleAutoPlay = () => {
    const newValue = !autoPlayEnabled;
    setAutoPlayEnabled(newValue);
    localStorage.setItem('autoplay_enabled', newValue.toString());
    toast.info(newValue ? "Autoplay enabled" : "Autoplay disabled");
  };
  
  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('sound_enabled', newValue.toString());
    toast.info(newValue ? "Sound enabled" : "Sound disabled");
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out");
    }
  };
  
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      toast.success("Account deleted successfully");
      navigate('/');
    } catch (error) {
      console.error("Delete account failed:", error);
      toast.error("Failed to delete account");
    }
  };
  
  const handleVerifyEmail = async () => {
    try {
      await sendEmailVerification();
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast.error("Failed to send verification email");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} />
      <main>
        <div className="container px-4 py-4 max-w-3xl">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          
          <div className="space-y-8">
            {/* User Profile Section */}
            {currentUser && (
              <div className="glass-card p-5 rounded-2xl">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  User Profile
                </h2>
                
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    {userData?.photo_url ? (
                      <img src={userData.photo_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{userData?.display_name || userData?.email || "User"}</h3>
                    <p className="text-sm text-muted-foreground">{userData?.email}</p>
                    <p className="text-sm mt-1">
                      <span className="text-primary font-medium">{userData?.credits || 0}</span> credits
                    </p>
                    
                    {currentUser.email && !isEmailVerified() && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 text-amber-500" 
                        onClick={handleVerifyEmail}
                      >
                        Verify Email
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/shop')}>
                    <Coins className="mr-2 h-4 w-4" />
                    Shop
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/login')}>
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-amber-500 hover:text-amber-600 hover:bg-amber-50/10" 
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                          Delete Account
                        </DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. All your data will be permanently removed.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <p className="text-sm text-muted-foreground">
                          By deleting your account, you will lose:
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
                          <li>All your remaining credits</li>
                          <li>Your saved liked videos</li>
                          <li>Your account settings</li>
                        </ul>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
            
            {/* Video Settings */}
            <div className="glass-card p-5 rounded-2xl">
              <h2 className="text-lg font-medium mb-4">Video Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoplay" className="text-sm font-medium">Autoplay Videos</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Automatically play videos while scrolling
                    </p>
                  </div>
                  <Switch 
                    id="autoplay" 
                    checked={autoPlayEnabled} 
                    onCheckedChange={toggleAutoPlay} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sound" className="text-sm font-medium flex items-center">
                      <Volume2 className="h-4 w-4 mr-1" /> Enable Sound
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enable sound when videos are played
                    </p>
                  </div>
                  <Switch 
                    id="sound" 
                    checked={soundEnabled} 
                    onCheckedChange={toggleSound} 
                  />
                </div>
              </div>
            </div>
            
            {/* API Key Section */}
            <div className="glass-card p-5 rounded-2xl">
              <h2 className="text-lg font-medium mb-4">Pixabay API Settings</h2>
              
              <form onSubmit={handleApiKeySubmit} className="space-y-4">
                <div>
                  <Label htmlFor="api-key" className="mb-2 block">
                    Custom API Key
                  </Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="api-key"
                      type="text" 
                      placeholder="Enter your Pixabay API key" 
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit">Save</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Feeling lag or slow performance? Try using your own API key.
                    <a 
                      href="https://pixabay.com/api/docs/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary ml-1 inline-flex items-center"
                    >
                      Get one here <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </p>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleResetApiKey}
                >
                  Reset to Default API Key
                </Button>
              </form>
            </div>
            
            {/* Notifications Settings */}
            <div className="glass-card p-5 rounded-2xl">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Settings
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications" className="text-sm font-medium">Push Notifications</Label>
                    <p className="text-xs text-muted-foreground mt-1">Receive app notifications</p>
                  </div>
                  <Switch id="push-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground mt-1">Receive email updates and offers</p>
                  </div>
                  <Switch id="email-notifications" />
                </div>
              </div>
            </div>
            
            {/* Help Center */}
            <div className="glass-card p-5 rounded-2xl">
              <h2 className="text-lg font-medium mb-4">Help Center</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Why is there no sound in some videos?
                  </h3>
                  <p className="text-sm text-muted-foreground ml-6 mt-1">
                    Some videos on Pixabay do not include audio. The availability of sound depends on the original upload.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    How does the credit system work?
                  </h3>
                  <p className="text-sm text-muted-foreground ml-6 mt-1">
                    You need 20 credits to download a video. New users automatically receive 50 credits.
                    You can earn more credits by watching rewarded ads or purchasing credit packages.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Privacy Policy */}
            <div className="glass-card p-5 rounded-2xl">
              <h2 className="text-lg font-medium mb-4">Legal Information</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Privacy Policy</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This app uses Pixabay API to display videos. We store your account information and preferences
                    in Firebase. Your personal data is protected and never shared with third parties.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium">Credits</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    All videos are provided by Pixabay and are subject to the 
                    <a 
                      href="https://pixabay.com/service/license/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary mx-1"
                    >
                      Pixabay Content License
                    </a>
                    . This app is not affiliated with Pixabay.
                  </p>
                </div>
              </div>
            </div>
            
            {/* AdMob Settings */}
            <div className="glass-card p-5 rounded-2xl">
              <h2 className="text-lg font-medium mb-4">Ad Settings</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ad-consent" className="text-sm font-medium">Personalized Ads</Label>
                  <p className="text-xs text-muted-foreground mt-1">Allow personalized ads based on your interests</p>
                </div>
                <Switch id="ad-consent" defaultChecked />
              </div>
            </div>
          </div>
        </div>
      </main>
      <MobileNavBar />
    </div>
  );
};

export default Settings;
