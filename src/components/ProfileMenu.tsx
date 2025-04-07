
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Settings, Heart, Coins } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProfileMenu = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  if (!currentUser) {
    return (
      <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
        Log in
      </Button>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            {userData?.photo_url ? (
              <AvatarImage src={userData.photo_url} alt="Profile" />
            ) : (
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userData?.display_name || userData?.email || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{userData?.email}</p>
            <p className="text-xs font-medium mt-1">
              <span className="text-primary">{userData?.credits || 0}</span> credits
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate('/')}>
            <User className="mr-2 h-4 w-4" />
            <span>Home</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/likes')}>
            <Heart className="mr-2 h-4 w-4" />
            <span>Likes</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/credits')}>
            <Coins className="mr-2 h-4 w-4" />
            <span>Credits</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
