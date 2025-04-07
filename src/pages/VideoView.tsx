import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchVideos, PixabayVideo, incrementVideoViews } from '@/services/pixabayService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import MobileNavBar from '@/components/MobileNavBar';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import VideoCard from '@/components/VideoCard';
import { Download, Heart, ZoomIn, ZoomOut, X, Share2 } from 'lucide-react';
import { showAdInterstitial } from '@/services/adService';
import { downloadWithAnimation } from '@/lib/utils';
import DownloadProgress, { DownloadStatus } from '@/components/DownloadProgress';

const VideoView = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { currentUser, userData, updateUserCredits } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [relatedVideos, setRelatedVideos] = useState<PixabayVideo[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);

  const { data: video, isLoading, error } = useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      const response = await fetchVideos({ id: videoId });
      if (response.hits.length === 0) throw new Error('Video not found');
      return response.hits[0];
    },
    enabled: !!videoId
  });

  useEffect(() => {
    if (!currentUser || !video) return;

    const checkIfLiked = async () => {
      try {
        const { data } = await supabase
          .from('liked_videos')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('video_id', video.id.toString())
          .single();
          
        setIsLiked(!!data);
      } catch (error) {
        console.error('Error checking if video is liked:', error);
      }
    };

    checkIfLiked();
  }, [currentUser, video]);

  useEffect(() => {
    if (!video) return;
    
    const fetchRelatedVideos = async () => {
      try {
        const tags = video.tags.split(',')[0].trim();
        
        const response = await fetchVideos({ 
          q: tags,
          per_page: 8,
          safesearch: true
        });
        
        const filteredVideos = response.hits.filter(v => v.id !== video.id);
        setRelatedVideos(filteredVideos.slice(0, 6));
      } catch (error) {
        console.error('Error fetching related videos:', error);
      }
    };
    
    fetchRelatedVideos();
  }, [video]);

  useEffect(() => {
    if (!currentUser || !video) return;
    
    const recordView = async () => {
      try {
        if (incrementVideoViews()) {
          showAdInterstitial();
        }
        
        await supabase
          .from('video_history')
          .upsert({
            user_id: currentUser.id,
            video_id: video.id.toString(),
            viewed_at: new Date()
          }, { onConflict: 'user_id,video_id' });
      } catch (error) {
        console.error('Error recording view history:', error);
      }
    };
    
    recordView();
  }, [currentUser, video]);

  // Simulated download progress
  useEffect(() => {
    if (downloadStatus === 'downloading') {
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
      
      return () => clearInterval(progressInterval);
    }
  }, [downloadStatus]);

  // Effect to change status to success when progress completes
  useEffect(() => {
    if (downloadProgress >= 100 && downloadStatus === 'downloading') {
      setDownloadStatus('success');
    }
  }, [downloadProgress, downloadStatus]);

  const handleToggleLike = async () => {
    if (!currentUser || !video) {
      toast.error("Please log in to like videos");
      navigate('/login');
      return;
    }
    
    try {
      if (isLiked) {
        await supabase
          .from('liked_videos')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('video_id', video.id.toString());
          
        setIsLiked(false);
        toast("Removed from likes");
      } else {
        await supabase
          .from('liked_videos')
          .insert([{
            user_id: currentUser.id,
            video_id: video.id.toString(),
            video_data: video,
            category: video.tags.split(',')[0]
          }]);
        
        setIsLiked(true);
        toast("Added to likes");
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error("Failed to update like status");
    }
  };

  const handleDownload = async () => {
    if (!currentUser || !video) {
      toast.error("Please log in to download videos");
      navigate('/login');
      return;
    }
    
    if (!userData || userData.credits < 20) {
      toast.error("Not enough credits. You need 20 credits to download.");
      navigate('/credits');
      return;
    }
    
    setDownloadStatus('downloading');
    setDownloadProgress(0);
    
    try {
      await updateUserCredits(-20);
      
      // Download the video
      const downloadUrl = video.videos.medium.url;
      const filename = `video_${video.id}.mp4`;
      
      // Use our utility function for downloading with animation
      const downloadSuccess = await downloadWithAnimation(downloadUrl, filename);
      
      if (downloadSuccess) {
        // Record download in Supabase
        await supabase
          .from('credit_purchases')
          .insert([{
            user_id: currentUser.id,
            amount: -20,
            credits: -20,
            product_id: 'download'
          }]);
        
        toast.success("Download started! 20 credits used.");
      } else {
        setDownloadStatus('error');
        toast.error("Download failed. Please try again.");
      }
    } catch (error) {
      console.error('Error downloading video:', error);
      toast.error("Download failed. Please try again.");
      setDownloadStatus('error');
    }
  };

  const handleZoomIn = () => {
    if (zoomLevel < 2) setZoomLevel(prev => prev + 0.25);
  };

  const handleZoomOut = () => {
    if (zoomLevel > 0.5) setZoomLevel(prev => prev - 0.25);
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };
  
  const handleShare = async () => {
    if (!video) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Video by ${video.user}`,
          text: `Check out this video: ${video.tags}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onSearch={() => {}} />
        <div className="container px-4 py-8">
          <div className="mb-6">
            <Skeleton className="h-[50vh] w-full rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-20 w-3/4 mb-8" />
          <h3 className="text-xl font-semibold mb-4">Related Videos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <MobileNavBar />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-background">
        <Header onSearch={() => {}} />
        <div className="container px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Video Not Found</h2>
          <p className="mb-6">The video you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
        <MobileNavBar />
      </div>
    );
  }

  const handleResetDownload = () => {
    setDownloadStatus('idle');
    setDownloadProgress(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} />
      <div className="container px-4 py-4 pb-20">
        <div 
          ref={videoContainerRef}
          className="relative mb-6 overflow-hidden rounded-lg"
          style={{ height: '50vh' }}
        >
          <div 
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-in-out"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <video 
              src={video.videos.medium.url} 
              controls 
              autoPlay 
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="absolute top-4 right-4 bg-background/80 rounded-full p-1 backdrop-blur">
            <Button size="icon" variant="ghost" onClick={handleZoomIn} className="h-8 w-8">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleZoomOut} className="h-8 w-8">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleResetZoom} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={handleToggleLike}
            variant={isLiked ? "default" : "outline"}
            className={isLiked ? "bg-red-500 hover:bg-red-600" : ""}
          >
            <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            {isLiked ? "Liked" : "Like"}
          </Button>
          
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Processing..." : "Download (20 credits)"}
          </Button>
          
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
        
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Video by {video.user}</h2>
                {userData && (
                  <span className="text-sm text-muted-foreground">
                    Credits: {userData.credits}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Tags: {video.tags}
              </p>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span>{video.views} views</span>
                <span>•</span>
                <span>{video.downloads} downloads</span>
                <span>•</span>
                <span>{video.likes} likes</span>
                <span>•</span>
                <span>{video.duration} seconds</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div>
          <h3 className="text-xl font-semibold mb-4">Related Videos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedVideos.map(relatedVideo => (
              <VideoCard key={relatedVideo.id} video={relatedVideo} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Download progress indicator */}
      <DownloadProgress 
        status={downloadStatus}
        fileName={video ? `video_${video.id}.mp4` : "video.mp4"}
        progress={downloadProgress}
        onClose={handleResetDownload}
      />
      
      <MobileNavBar />
    </div>
  );
};

export default VideoView;
