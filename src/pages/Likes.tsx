
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/Header';
import Categories from '@/components/Categories';
import VideosGrid from '@/components/VideosGrid';
import { getLikedVideos, getLikedVideosByCategory, initializeLikedVideos } from '@/stores/likedVideosStore';
import { PixabayVideo } from '@/services/pixabayService';
import MobileNavBar from '@/components/MobileNavBar';

const Likes = () => {
  const [videos, setVideos] = useState<PixabayVideo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize liked videos from local storage
    initializeLikedVideos();
    
    // Load videos based on category filter
    const loadVideos = () => {
      try {
        const filteredVideos = selectedCategory 
          ? getLikedVideosByCategory(selectedCategory)
          : getLikedVideos();
          
        setVideos(filteredVideos);
      } catch (error) {
        console.error('Error loading liked videos:', error);
        toast({
          title: 'Error',
          description: 'Failed to load liked videos.',
          variant: 'destructive',
        });
      }
    };
    
    loadVideos();
    
    // Add event listener to refresh when storage changes
    window.addEventListener('storage', loadVideos);
    document.addEventListener('likedVideosUpdated', loadVideos);
    
    return () => {
      window.removeEventListener('storage', loadVideos);
      document.removeEventListener('likedVideosUpdated', loadVideos);
    };
  }, [selectedCategory, toast]);

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} />
      <main>
        <div className="container px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">Your Liked Videos</h1>
          
          <Categories
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
          
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-secondary/30 p-8 rounded-2xl glass-card">
                <h2 className="text-xl font-semibold mb-2">No liked videos yet</h2>
                <p className="text-muted-foreground">
                  Videos you like will appear here. Go explore and find some videos you love!
                </p>
              </div>
            </div>
          ) : (
            <VideosGrid videos={videos} isLoading={false} />
          )}
        </div>
      </main>
      <MobileNavBar />
    </div>
  );
};

export default Likes;
