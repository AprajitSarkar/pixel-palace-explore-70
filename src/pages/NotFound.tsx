
import React from 'react';
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center max-w-md mx-auto glass-card p-8 rounded-2xl">
        <div className="mb-6 text-accent text-6xl font-bold">404</div>
        <h1 className="text-2xl font-bold mb-4 text-foreground">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Button 
          onClick={() => window.location.href = '/'}
          className="rounded-full bg-primary hover:bg-primary/80"
        >
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
