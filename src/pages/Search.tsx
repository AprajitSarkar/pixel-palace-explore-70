
import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/Header';
import VideosGrid from '@/components/VideosGrid';
import { fetchVideos, PixabayVideo } from '@/services/pixabayService';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MobileNavBar from '@/components/MobileNavBar';
import { checkAppReadiness } from '@/lib/utils';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<PixabayVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appReady, setAppReady] = useState(true);
  const [appErrors, setAppErrors] = useState<string[]>([]);
  const { toast } = useToast();

  // Check app readiness on mount
  useEffect(() => {
    const checkReady = async () => {
      try {
        const { ready, errors } = await checkAppReadiness();
        setAppReady(ready);
        setAppErrors(errors);
        
        if (!ready) {
          console.error("App is not ready to load. Errors:", errors);
          setError("App is having trouble connecting to services. Please check your internet connection.");
        }
      } catch (e) {
        console.error("Error checking app readiness:", e);
      }
    };
    
    checkReady();
  }, []);

  // Add initial loading of some videos when the page first loads
  useEffect(() => {
    const loadInitialVideos = async () => {
      if (!appReady) {
        console.log("App is not ready, skipping initial video load");
        return;
      }
      
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
  }, [appReady]);

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
          <form onSubmit={handleSearch} className="mb-6 animate-fade-in">
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
              <Button type="submit" className="rounded-full hover-scale" disabled={isLoading || !appReady}>
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>
          
          {appErrors.length > 0 && (
            <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-4 rounded-md mb-6 animate-fade-in">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium">Connection Issues</h3>
                  <ul className="mt-2 text-sm space-y-1">
                    {appErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 animate-fade-in">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-center items-center py-20 animate-fade-in">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3">Loading videos...</span>
            </div>
          )}
          
          {!isLoading && videos.length > 0 && (
            <VideosGrid videos={videos} isLoading={false} />
          )}
          
          {!isLoading && videos.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
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
