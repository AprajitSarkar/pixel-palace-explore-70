
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b border-border/40">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-primary" onClick={() => navigate('/')}>
            Pixel<span className="text-accent">Explore</span>
          </h1>
        </div>

        {!isMobile && (
          <form onSubmit={handleSubmit} className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search videos..."
                className="pl-10 bg-secondary/70 border-primary/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        )}

        <div className="flex items-center space-x-2">
          {!isMobile && (
            <>
              {currentUser ? (
                <Button variant="outline" size="sm" className="rounded-full text-sm" onClick={handleLogout}>
                  Log out
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="rounded-full text-sm" onClick={handleLogin}>
                  Log in
                </Button>
              )}
            </>
          )}
          
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile search & menu */}
      {isMobile && menuOpen && (
        <div className="container px-4 pb-4 space-y-4 bg-background/95 backdrop-blur-lg">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search videos..."
                className="pl-10 bg-secondary/70 border-primary/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;
