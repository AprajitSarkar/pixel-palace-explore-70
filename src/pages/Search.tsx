
import React, { useState } from 'react';
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
  const { toast } = useToast();

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
    
    try {
      const response = await fetchVideos({
        q: searchQuery,
        per_page: 50,
        safesearch: true,
      });
      
      setVideos(response.hits);
      
      if (response.hits.length === 0) {
        toast({
          title: 'No results',
          description: `No videos found for "${searchQuery}"`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
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
              <Button type="submit" className="rounded-full">
                Search
              </Button>
            </div>
          </form>
          
          {videos.length > 0 ? (
            <VideosGrid videos={videos} isLoading={isLoading} />
          ) : !isLoading && (
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
