
import React from 'react';
import { useNavigate } from 'react-router-dom';
import VideoCard from './VideoCard';
import { PixabayVideo } from '@/services/pixabayService';

interface VideoCardWrapperProps {
  video: PixabayVideo;
  autoPlayEnabled?: boolean;
}

const VideoCardWrapper: React.FC<VideoCardWrapperProps> = ({ video, autoPlayEnabled = false }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/video/${video.id}`);
  };
  
  return (
    <div onClick={handleClick} className="cursor-pointer hover:opacity-90 transition-opacity">
      <VideoCard video={video} autoPlayEnabled={autoPlayEnabled} />
    </div>
  );
};

export default VideoCardWrapper;
