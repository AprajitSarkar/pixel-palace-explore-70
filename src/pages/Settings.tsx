
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/Header';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info, ExternalLink } from "lucide-react";
import MobileNavBar from '@/components/MobileNavBar';
import { toast } from "sonner";

const Settings = () => {
  const [customApiKey, setCustomApiKey] = useState<string>(
    localStorage.getItem('pixabay_api_key') || ""
  );
  const { toast: uiToast } = useToast();

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

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} />
      <main>
        <div className="container px-4 py-4 max-w-3xl">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          
          <div className="space-y-8">
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
              </div>
            </div>
            
            {/* Privacy Policy */}
            <div className="glass-card p-5 rounded-2xl">
              <h2 className="text-lg font-medium mb-4">Legal Information</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Privacy Policy</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This app uses Pixabay API to display videos. We do not store any personal data, except for your preferences in local storage on your device.
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
