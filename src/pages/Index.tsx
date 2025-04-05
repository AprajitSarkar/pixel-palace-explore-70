
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/Header';
import Categories from '@/components/Categories';
import VideosGrid from '@/components/VideosGrid';
import ApiKeyForm from '@/components/ApiKeyForm';
import { fetchVideos, VideoSearchParams, PixabayVideo } from '@/services/pixabayService';

const Index = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [videos, setVideos] = useState<PixabayVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  // Check for saved API key on initial load
  useEffect(() => {
    const storedKey = localStorage.getItem('pixabay_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const loadVideos = useCallback(async () => {
    if (!apiKey) return;

    setIsLoading(true);
    try {
      // Update API key in the service
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
  }, [apiKey, page, searchQuery, selectedCategory, toast]);

  useEffect(() => {
    if (apiKey) {
      // Reset page when search query or category changes
      setPage(1);
      loadVideos();
    }
  }, [apiKey, searchQuery, selectedCategory, loadVideos]);

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

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    
    // We need to replace the placeholder in the service
    // This is done by updating window.__PIXABAY_API_KEY
    (window as any).__PIXABAY_API_KEY = key;
  };

  return (
    <div className="min-h-screen bg-background">
      {!apiKey ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <ApiKeyForm onSubmit={handleApiKeySubmit} />
        </div>
      ) : (
        <>
          <Header onSearch={handleSearch} />
          <main>
            <Categories
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />
            <VideosGrid videos={videos} isLoading={isLoading} />
          </main>
        </>
      )}
    </div>
  );
};

export default Index;
