
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, Settings, Home, LogIn, ShoppingCart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';

const MobileNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="px-4 py-2 bg-background/80 backdrop-blur-lg border-t border-border/40">
        <div className="flex justify-around">
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center rounded-full p-2 ${
              isActive('/') ? 'text-primary bg-primary/10' : 'text-muted-foreground'
            }`}
            onClick={() => navigate('/')}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col items-center justify-center rounded-full p-2 ${
              isActive('/search') ? 'text-primary bg-primary/10' : 'text-muted-foreground'
            }`}
            onClick={() => navigate('/search')}
          >
            <Search className="h-6 w-6" />
            <span className="text-xs mt-1">Search</span>
          </Button>
          
          {currentUser ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={`flex flex-col items-center justify-center rounded-full p-2 ${
                  isActive('/likes') ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                }`}
                onClick={() => navigate('/likes')}
              >
                <Heart className="h-6 w-6" />
                <span className="text-xs mt-1">Likes</span>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className={`flex flex-col items-center justify-center rounded-full p-2 ${
                  isActive('/shop') ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                }`}
                onClick={() => navigate('/shop')}
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="text-xs mt-1">Shop</span>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className={`flex flex-col items-center justify-center rounded-full p-2 ${
                  isActive('/settings') ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                }`}
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-6 w-6" />
                <span className="text-xs mt-1">Settings</span>
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className={`flex flex-col items-center justify-center rounded-full p-2 ${
                isActive('/login') ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
              onClick={() => navigate('/login')}
            >
              <LogIn className="h-6 w-6" />
              <span className="text-xs mt-1">Login</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileNavBar;
