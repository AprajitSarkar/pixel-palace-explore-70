
// We'll use a placeholder API key - users should replace with their own
const API_KEY = "REPLACE_WITH_YOUR_API_KEY";
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

export const fetchVideos = async (params: VideoSearchParams = {}): Promise<PixabayResponse> => {
  // Get the API key from localStorage
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
