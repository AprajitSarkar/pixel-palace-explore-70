
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';

interface ApiKeyFormProps {
  onSubmit: (apiKey: string) => void;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSubmit }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved API key in localStorage
    const storedKey = localStorage.getItem('pixabay_api_key');
    if (storedKey) {
      setSavedKey(storedKey);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }

    // Save to localStorage
    localStorage.setItem('pixabay_api_key', apiKey);
    onSubmit(apiKey);
    toast.success('API key saved successfully!');
  };

  const handleUseSaved = () => {
    if (savedKey) {
      onSubmit(savedKey);
    }
  };

  if (savedKey) {
    return (
      <Card className="w-full max-w-md mx-auto bg-secondary/50 backdrop-blur-sm border border-primary/20">
        <CardHeader>
          <CardTitle>Saved API Key Found</CardTitle>
          <CardDescription>
            We found a previously saved Pixabay API key.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setSavedKey(null)}>
            Use Different Key
          </Button>
          <Button onClick={handleUseSaved}>
            Use Saved Key
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto glass-card">
      <CardHeader>
        <CardTitle className="text-center text-primary">Pixabay API Key Required</CardTitle>
        <CardDescription className="text-center">
          To use this app, you need a Pixabay API key. You can get one for free by signing up at{' '}
          <a 
            href="https://pixabay.com/service/about/api/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-accent hover:underline"
          >
            Pixabay API
          </a>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Input
            type="text"
            placeholder="Enter your Pixabay API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="bg-background/50 border-primary/30"
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Save & Continue
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ApiKeyForm;
