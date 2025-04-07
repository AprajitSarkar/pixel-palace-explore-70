
import React, { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/Header';
import VideosGrid from '@/components/VideosGrid';
import { fetchVideos, PixabayVideo } from '@/services/pixabayService';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MobileNavBar from '@/components/MobileNavBar';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<PixabayVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Add initial loading of some videos when the page first loads
  useEffect(() => {
    const loadInitialVideos = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching initial videos...");
        const response = await fetchVideos({
          q: 'nature', // Start with a default search term
          per_page: 20,
          safesearch: true,
        });
        
        console.log("Initial videos fetched:", response.hits.length);
        setVideos(response.hits);
        
        if (response.hits.length === 0) {
          setError("No initial videos found. API might be unavailable.");
        }
      } catch (error) {
        console.error('Error loading initial videos:', error);
        setError("Failed to load videos. Please check your connection.");
        toast({
          title: 'Error',
          description: 'Failed to load initial videos',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialVideos();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a search term',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Searching for videos with query: "${searchQuery}"`);
      const response = await fetchVideos({
        q: searchQuery,
        per_page: 50,
        safesearch: true,
      });
      
      console.log(`Search results: ${response.hits.length} videos found`);
      setVideos(response.hits);
      
      if (response.hits.length === 0) {
        toast({
          title: 'No results',
          description: `No videos found for "${searchQuery}"`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(`Failed to search: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: 'Error',
        description: 'Failed to search videos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} />
      <main>
        <div className="container px-4 pt-4 pb-20">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search for videos..."
                  className="pl-10 bg-secondary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="rounded-full" disabled={isLoading}>
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>
          
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3">Loading videos...</span>
            </div>
          )}
          
          {!isLoading && videos.length > 0 && (
            <VideosGrid videos={videos} isLoading={false} />
          )}
          
          {!isLoading && videos.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-secondary/30 p-8 rounded-2xl glass-card">
                <h2 className="text-xl font-semibold mb-2">Start searching</h2>
                <p className="text-muted-foreground">
                  Enter a search term above to find videos
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <MobileNavBar />
    </div>
  );
};

export default Search;
