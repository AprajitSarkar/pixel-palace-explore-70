
import { supabase } from '@/lib/supabase';
import { PixabayVideo } from '@/services/pixabayService';

// Local cache of liked videos
let likedVideos: PixabayVideo[] = [];

// Event to notify components when liked videos are updated
const likedVideosUpdatedEvent = new Event('likedVideosUpdated');

// Initialize liked videos from Supabase for logged-in user
export const initializeLikedVideos = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // If not logged in, get from local storage
    const storedLikes = localStorage.getItem('liked_videos');
    if (storedLikes) {
      try {
        likedVideos = JSON.parse(storedLikes);
      } catch (error) {
        console.error('Error parsing stored likes:', error);
        likedVideos = [];
      }
    }
    return;
  }

  try {
    const { data, error } = await supabase
      .from('liked_videos')
      .select('video_data')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching liked videos:', error);
      return;
    }

    if (data) {
      likedVideos = data.map(item => item.video_data);
    }
  } catch (error) {
    console.error('Error in initializeLikedVideos:', error);
  }
};

// Check if a video is liked
export const isVideoLiked = (videoId: number) => {
  return likedVideos.some(video => video.id === videoId);
};

// Get all liked videos
export const getLikedVideos = () => {
  return [...likedVideos];
};

// Get liked videos by category
export const getLikedVideosByCategory = (category: string) => {
  return likedVideos.filter(video => {
    // Check if video has tags containing the category
    return video.tags.toLowerCase().includes(category.toLowerCase());
  });
};

// Toggle liked status for a video
export const toggleLikedVideo = async (video: PixabayVideo) => {
  const { data: { user } } = await supabase.auth.getUser();
  const videoIndex = likedVideos.findIndex(v => v.id === video.id);
  let isNowLiked = false;

  if (videoIndex >= 0) {
    // Video is already liked, remove it
    likedVideos = likedVideos.filter(v => v.id !== video.id);
    
    if (user) {
      // Remove from Supabase if logged in
      await supabase
        .from('liked_videos')
        .delete()
        .eq('user_id', user.id)
        .eq('video_id', video.id.toString());
    }
  } else {
    // Video is not liked, add it
    likedVideos = [...likedVideos, video];
    isNowLiked = true;
    
    if (user) {
      // Add to Supabase if logged in
      await supabase
        .from('liked_videos')
        .insert([{
          user_id: user.id,
          video_id: video.id.toString(),
          video_data: video,
          category: video.tags.split(',')[0]
        }]);
    }
  }

  // Update local storage for non-logged-in users
  if (!user) {
    localStorage.setItem('liked_videos', JSON.stringify(likedVideos));
  }

  // Dispatch event to notify components
  document.dispatchEvent(likedVideosUpdatedEvent);
  
  return isNowLiked;
};
