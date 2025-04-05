
// We'll use a placeholder API key - users should replace with their own
const API_KEY = "49658971-12bf63930d640b2f9ffcc901c";
const BASE_URL = "https://pixabay.com/api/videos/";

export interface PixabayVideo {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  duration: number;
  videos: {
    large: VideoFormat;
    medium: VideoFormat;
    small: VideoFormat;
    tiny: VideoFormat;
  };
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

interface VideoFormat {
  url: string;
  width: number;
  height: number;
  size: number;
  thumbnail: string;
}

export interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayVideo[];
}

export type VideoSearchParams = {
  q?: string;
  lang?: string;
  id?: string;
  video_type?: 'all' | 'film' | 'animation';
  category?: string;
  min_width?: number;
  min_height?: number;
  editors_choice?: boolean;
  safesearch?: boolean;
  order?: 'popular' | 'latest';
  page?: number;
  per_page?: number;
};

// Track video views for ad serving
let viewedVideosCount = 0;

export const incrementVideoViews = () => {
  viewedVideosCount += 1;
  return viewedVideosCount % 5 === 0; // Return true every 5 views
};

export const getViewedVideosCount = () => viewedVideosCount;
export const resetViewedVideosCount = () => { viewedVideosCount = 0; };

export const fetchVideos = async (params: VideoSearchParams = {}): Promise<PixabayResponse> => {
  // Get the API key from localStorage or use default
  const apiKey = localStorage.getItem('pixabay_api_key') || API_KEY;
  
  const queryParams = new URLSearchParams({
    key: apiKey,
    ...Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined)
    )
  });

  try {
    const response = await fetch(`${BASE_URL}?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }
};

export const getPopularCategories = (): string[] => {
  return [
    "nature", 
    "people", 
    "animals", 
    "food", 
    "travel", 
    "sports", 
    "music",
    "backgrounds"
  ];
};

export const downloadVideo = async (video: PixabayVideo): Promise<string> => {
  try {
    // Get the best available format
    const videoUrl = video.videos.large.url || 
                    video.videos.medium.url || 
                    video.videos.small.url || 
                    video.videos.tiny.url;
    
    // Return the URL with download parameter
    return `${videoUrl}?download=1`;
  } catch (error) {
    console.error("Error preparing download:", error);
    throw error;
  }
};
