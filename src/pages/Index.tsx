
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/Header';
import Categories from '@/components/Categories';
import VideosGrid from '@/components/VideosGrid';
import { fetchVideos, VideoSearchParams, PixabayVideo } from '@/services/pixabayService';
import { initializeLikedVideos } from '@/stores/likedVideosStore';
import { initializeAds, showAdBanner } from '@/services/adService';
import MobileNavBar from '@/components/MobileNavBar';
import SplashScreen from '@/components/SplashScreen';

const Index = () => {
  const [videos, setVideos] = useState<PixabayVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showSplash, setShowSplash] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(localStorage.getItem('autoplay_enabled') === 'true');
  const { toast } = useToast();

  useEffect(() => {
    // Initialize liked videos store
    initializeLikedVideos();
    
    // Initialize ads
    initializeAds();
    
    // Show banner ad
    showAdBanner();
    
    // Listen for autoplay setting changes
    const handleStorageChange = () => {
      setAutoPlayEnabled(localStorage.getItem('autoplay_enabled') === 'true');
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: VideoSearchParams = {
        page,
        per_page: 20,
        safesearch: true,
      };

      if (searchQuery) {
        params.q = searchQuery;
      }

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      // Use function instead of directly setting the URL
      const response = await fetchVideos(params);
      
      if (page === 1) {
        setVideos(response.hits);
      } else {
        setVideos(prev => [...prev, ...response.hits]);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      toast({
        title: 'Error',
        description: 'Failed to load videos. Please check your API key.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, selectedCategory, toast]);

  useEffect(() => {
    // Reset page when search query or category changes
    setPage(1);
    loadVideos();
  }, [searchQuery, selectedCategory, loadVideos]);

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        !isLoading
      ) {
        setPage(prevPage => prevPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading]);

  // Load more videos when page changes
  useEffect(() => {
    if (page > 1) {
      loadVideos();
    }
  }, [page, loadVideos]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handleSplashFinished = () => {
    setShowSplash(false);
  };

  // Show splash screen on first load
  if (showSplash) {
    return <SplashScreen onFinished={handleSplashFinished} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} />
      <main className="pb-20">
        <Categories
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
        <VideosGrid 
          videos={videos} 
          isLoading={isLoading} 
          autoPlayEnabled={autoPlayEnabled}
        />
      </main>
      <MobileNavBar />
    </div>
  );
};

export default Index;
