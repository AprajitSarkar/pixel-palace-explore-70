
import React from 'react';
import VideoCardWrapper from './VideoCardWrapper';
import { PixabayVideo } from '@/services/pixabayService';
import { useIsMobile } from '@/hooks/use-mobile';

interface VideosGridProps {
  videos: PixabayVideo[];
  isLoading: boolean;
  autoPlayEnabled?: boolean;
}

const VideosGrid: React.FC<VideosGridProps> = ({ videos, isLoading, autoPlayEnabled = false }) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="video-grid container px-4 pt-4 pb-12">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col space-y-2 animate-pulse">
            <div className="aspect-video bg-secondary/20 rounded-2xl" />
            <div className="h-4 bg-secondary/20 rounded w-2/3" />
            <div className="h-4 bg-secondary/20 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="mb-4 rounded-full bg-secondary/20 p-3">
          <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground">No videos found</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-md">
          Try adjusting your search or category filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className={`container px-4 pt-4 pb-12 ${isMobile ? 'grid grid-cols-1 gap-4' : 'video-grid'}`}>
      {videos.map((video) => (
        <VideoCardWrapper key={video.id} video={video} autoPlayEnabled={autoPlayEnabled} />
      ))}
    </div>
  );
};

export default VideosGrid;
