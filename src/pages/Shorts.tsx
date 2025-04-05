
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Heart, Download, Volume, VolumeX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { fetchVideos, PixabayVideo } from '@/services/pixabayService';
import { toast } from "sonner";
import { isVideoLiked, toggleLikedVideo } from '@/stores/likedVideosStore';
import { showAdInterstitial } from '@/services/adService';
import MobileNavBar from '@/components/MobileNavBar';

const Shorts = () => {
  const [videos, setVideos] = useState<PixabayVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const { currentUser, userData, updateUserCredits } = useAuth();
  const navigate = useNavigate();
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Load initial videos
    loadVideos();
    
    // Listen for swipe events
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        navigateVideo(-1);
      } else if (e.key === 'ArrowDown') {
        navigateVideo(1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
    };
  }, []);
  
  // Fetch more videos when we're close to the end of the list
  useEffect(() => {
    if (videos.length > 0 && currentIndex >= videos.length - 2) {
      loadMoreVideos();
    }
  }, [currentIndex, videos.length]);
  
  // Auto-play current video when index changes
  useEffect(() => {
    if (videos.length > 0) {
      const currentVideo = videoRefs.current[currentIndex];
      if (currentVideo) {
        // Pause all videos first
        Object.values(videoRefs.current).forEach(video => {
          if (video) video.pause();
        });
        
        // Play current video
        currentVideo.currentTime = 0;
        const playPromise = currentVideo.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Auto-play prevented:", error);
          });
        }
        
        // Setup auto scroll for next video after video duration
        if (autoScrollTimeoutRef.current) {
          clearTimeout(autoScrollTimeoutRef.current);
        }
        
        if (autoScrollEnabled && currentIndex < videos.length - 1) {
          // Use video duration to determine when to auto-scroll
          const duration = videos[currentIndex]?.duration || 10;
          autoScrollTimeoutRef.current = setTimeout(() => {
            navigateVideo(1);
          }, duration * 1000); // Convert to milliseconds
        }
      }
    }
  }, [currentIndex, videos, autoScrollEnabled]);
  
  const loadVideos = async () => {
    setIsLoading(true);
    try {
      const response = await fetchVideos({
        page: 1,
        per_page: 10,
        safesearch: true,
        order: 'popular'
      });
      
      setVideos(response.hits);
    } catch (error) {
      toast.error("Failed to load videos");
      console.error('Error loading videos:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadMoreVideos = async () => {
    setIsLoading(true);
    try {
      const response = await fetchVideos({
        page: Math.ceil(videos.length / 10) + 1,
        per_page: 10,
        safesearch: true,
        order: 'popular'
      });
      
      setVideos([...videos, ...response.hits]);
    } catch (error) {
      toast.error("Failed to load more videos");
      console.error('Error loading videos:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const navigateVideo = (direction: number) => {
    const newIndex = currentIndex + direction;
    
    // Ensure we don't navigate past the bounds
    if (newIndex >= 0 && newIndex < videos.length) {
      setCurrentIndex(newIndex);
      
      // Show an ad every 5 videos
      if (newIndex % 5 === 0 && newIndex > 0) {
        showAdInterstitial();
      }
      
      // Reset auto scroll timer
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
    }
  };
  
  const toggleMute = () => {
    if (videoRefs.current[currentIndex]) {
      const video = videoRefs.current[currentIndex];
      if (video) {
        video.muted = !video.muted;
        setIsMuted(!isMuted);
      }
    }
  };
  
  const handleLike = (video: PixabayVideo) => {
    const isNowLiked = toggleLikedVideo(video);
    toast[isNowLiked ? "success" : "info"](
      isNowLiked ? "Video added to likes" : "Video removed from likes"
    );
  };
  
  const handleDownload = async (video: PixabayVideo) => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      toast.error("Please login to download videos");
      navigate('/login');
      return;
    }
    
    // Check if user has enough credits
    if (userData && userData.credits < 20) {
      toast.error("Not enough credits. You need 20 credits to download a video.");
      navigate('/shop');
      return;
    }
    
    try {
      // Show ad on download
      showAdInterstitial();
      
      // Deduct credits
      await updateUserCredits(-20);
      
      // Get download URL
      const downloadUrl = video.videos.medium.url;
      
      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `pixelexplore-video-${video.id}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success("Download started. 20 credits used.");
    } catch (error) {
      toast.error("Download failed");
      console.error("Download error:", error);
    }
  };
  
  const toggleAutoScroll = () => {
    setAutoScrollEnabled(!autoScrollEnabled);
    toast.info(!autoScrollEnabled ? "Auto-scroll enabled" : "Auto-scroll disabled");
    
    if (!autoScrollEnabled && videos.length > 0) {
      // If enabling auto-scroll, start the timer
      const duration = videos[currentIndex]?.duration || 10;
      autoScrollTimeoutRef.current = setTimeout(() => {
        navigateVideo(1);
      }, duration * 1000);
    } else if (autoScrollEnabled && autoScrollTimeoutRef.current) {
      // If disabling auto-scroll, clear the timer
      clearTimeout(autoScrollTimeoutRef.current);
    }
  };
  
  if (isLoading && videos.length === 0) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="h-screen w-full bg-black relative overflow-hidden">
      {/* Video Container */}
      <div className="h-full w-full">
        {videos.length > 0 && (
          <div className="relative h-full">
            {/* Current video */}
            <div className="absolute inset-0 flex items-center justify-center">
              <video
                ref={el => (videoRefs.current[currentIndex] = el)}
                src={videos[currentIndex].videos.medium.url}
                className="h-full w-full object-contain"
                loop
                playsInline
                muted={isMuted}
              />
            </div>
            
            {/* Video info and actions */}
            <div className="absolute inset-x-0 bottom-20 px-4 py-2 bg-gradient-to-t from-black/70 to-transparent">
              <h2 className="text-white font-medium text-lg">
                {videos[currentIndex].tags.split(',')[0]}
              </h2>
              <p className="text-white/80 text-sm">
                By {videos[currentIndex].user}
              </p>
              <div className="flex items-center mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-full bg-white/10 border-white/20 text-white"
                  onClick={toggleAutoScroll}
                >
                  {autoScrollEnabled ? "Auto-scroll ON" : "Auto-scroll OFF"}
                </Button>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="absolute right-4 bottom-1/3 flex flex-col space-y-4">
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleMute}
                className="h-12 w-12 rounded-full bg-black/20 text-white"
              >
                {isMuted ? <Volume className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleLike(videos[currentIndex])}
                className="h-12 w-12 rounded-full bg-black/20 text-white"
              >
                <Heart className={`h-6 w-6 ${isVideoLiked(videos[currentIndex].id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDownload(videos[currentIndex])}
                className="h-12 w-12 rounded-full bg-black/20 text-white"
              >
                <Download className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <MobileNavBar />
    </div>
  );
};

export default Shorts;
