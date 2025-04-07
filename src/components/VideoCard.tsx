
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume, Volume2, Heart, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { PixabayVideo, incrementVideoViews } from '@/services/pixabayService';
import { isVideoLiked, toggleLikedVideo } from '@/stores/likedVideosStore';
import { toast } from "sonner";
import { showAdInterstitial } from '@/services/adService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface VideoCardProps {
  video: PixabayVideo;
  autoPlayEnabled?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, autoPlayEnabled = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(isVideoLiked(video.id));
  const [isDownloading, setIsDownloading] = useState(false);
  const { currentUser, userData, updateUserCredits } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && autoPlayEnabled) {
            if (videoRef.current) {
              videoRef.current.play().catch(err => {
                console.log("Auto-play prevented:", err);
              });
              setIsPlaying(true);
            }
          } else {
            if (videoRef.current && isPlaying) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: 0.7 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [autoPlayEnabled, isPlaying]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        if (incrementVideoViews()) {
          showAdInterstitial();
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = async () => {
    const isNowLiked = await toggleLikedVideo(video);
    setLiked(isNowLiked);
    toast[isNowLiked ? "success" : "info"](
      isNowLiked ? "Video added to likes" : "Video removed from likes"
    );
  };

  const handleDownload = async () => {
    if (!currentUser) {
      toast.error("Please login to download videos");
      navigate('/login');
      return;
    }
    
    if (userData && userData.credits < 20) {
      toast.error("Not enough credits. You need 20 credits to download a video.");
      navigate('/credits');
      return;
    }
    
    setIsDownloading(true);
    try {
      showAdInterstitial();
      await updateUserCredits(-20);
      const downloadUrl = video.videos.medium.url;
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
    } finally {
      setIsDownloading(false);
    }
  };

  const getVideoSource = () => {
    if (window.innerWidth <= 640) {
      return video.videos.tiny.url;
    } else if (window.innerWidth <= 1024) {
      return video.videos.small.url;
    } else {
      return video.videos.medium.url;
    }
  };

  return (
    <div 
      className="relative overflow-hidden rounded-2xl glass-card transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (isPlaying && !autoPlayEnabled) {
          setIsPlaying(false);
          videoRef.current?.pause();
        }
      }}
    >
      <div className="relative aspect-video">
        {!isPlaying && (
          <img 
            src={video.videos.medium.thumbnail} 
            alt={video.tags} 
            className="w-full h-full object-cover rounded-t-2xl"
          />
        )}
        
        <video 
          ref={videoRef}
          src={getVideoSource()}
          className={`absolute inset-0 w-full h-full object-cover rounded-t-2xl ${!isPlaying ? 'hidden' : ''}`}
          muted={isMuted}
          playsInline
          loop
        />
        
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center
                      transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <Button 
            size="icon"
            variant="ghost"
            className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
            onClick={handlePlayPause}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-sm text-foreground line-clamp-1">
              {video.tags.split(',')[0]}
            </h3>
            <p className="text-xs text-muted-foreground">{video.duration}s</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {isPlaying && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 rounded-full"
                onClick={handleMuteToggle}
              >
                {isMuted ? <Volume className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            )}
            <Button 
              size="icon" 
              variant="ghost" 
              className={`h-8 w-8 rounded-full ${liked ? 'text-accent bg-accent/20' : 'text-accent hover:text-accent hover:bg-accent/20'}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 rounded-full text-primary hover:bg-primary/20"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download className={`h-4 w-4 ${isDownloading ? 'animate-pulse' : ''}`} />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center mt-2">
          {video.userImageURL ? (
            <img 
              src={video.userImageURL} 
              alt={video.user} 
              className="w-6 h-6 rounded-full mr-2"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/20 mr-2" />
          )}
          <span className="text-xs text-muted-foreground">{video.user}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
