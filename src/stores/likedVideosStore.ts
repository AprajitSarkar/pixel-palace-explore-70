
import { PixabayVideo } from "@/services/pixabayService";

// Simple in-memory store for liked videos
let likedVideos: PixabayVideo[] = [];

// Initialize from localStorage
export const initializeLikedVideos = () => {
  try {
    const storedLikes = localStorage.getItem('liked_videos');
    if (storedLikes) {
      likedVideos = JSON.parse(storedLikes);
    }
  } catch (error) {
    console.error("Error loading liked videos:", error);
  }
};

export const saveLikedVideos = () => {
  try {
    localStorage.setItem('liked_videos', JSON.stringify(likedVideos));
  } catch (error) {
    console.error("Error saving liked videos:", error);
  }
};

export const getLikedVideos = () => {
  return [...likedVideos];
};

export const getLikedVideosByCategory = (category: string | null) => {
  if (!category) return [...likedVideos];
  return likedVideos.filter(video => video.tags.includes(category));
};

export const isVideoLiked = (videoId: number) => {
  return likedVideos.some(v => v.id === videoId);
};

export const toggleLikedVideo = (video: PixabayVideo) => {
  const index = likedVideos.findIndex(v => v.id === video.id);
  if (index > -1) {
    likedVideos.splice(index, 1);
  } else {
    likedVideos.push(video);
  }
  saveLikedVideos();
  return index === -1; // Return true if video was added to likes
};
