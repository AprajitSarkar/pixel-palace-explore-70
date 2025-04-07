import { supabase } from '@/lib/supabase';

export interface PixabayVideo {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  duration: number;
  picture_id: string;
  videos: {
    large: {
      url: string;
      width: number;
      height: number;
      size: number;
    };
    medium: {
      url: string;
      width: number;
      height: number;
      size: number;
      thumbnail: string;
    };
    small: {
      url: string;
      width: number;
      height: number;
      size: number;
    };
    tiny: {
      url: string;
      width: number;
      height: number;
      size: number;
    };
  };
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

export interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayVideo[];
}

export interface VideoSearchParams {
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
}

// Default API key
const DEFAULT_API_KEY = '49658971-12bf63930d640b2f9ffcc901c';

// Get API key from localStorage or use default
export const getApiKey = (): string => {
  return localStorage.getItem('pixabay_api_key') || DEFAULT_API_KEY;
};

// Set API key in localStorage
export const setApiKey = (apiKey: string): void => {
  localStorage.setItem('pixabay_api_key', apiKey);
};

// Fetch videos from Pixabay API
export const fetchVideos = async (params: VideoSearchParams): Promise<PixabayResponse> => {
  const apiKey = getApiKey();
  
  const queryParams = new URLSearchParams();
  queryParams.append('key', apiKey);
  
  // Add all params to query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });
  
  try {
    const response = await fetch(`https://pixabay.com/api/videos/?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.status}`);
    }
    
    const data: PixabayResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

// Fetch video by ID
export const fetchVideoById = async (id: string): Promise<PixabayVideo | null> => {
  try {
    const response = await fetchVideos({ id });
    return response.hits[0] || null;
  } catch (error) {
    console.error('Error fetching video by ID:', error);
    throw error;
  }
};

// Add downloadVideo function
export const downloadVideo = async (video: PixabayVideo): Promise<string> => {
  // This function returns the URL of the video to download
  return video.videos.medium.url;
};

// Record video view in history
export const recordVideoView = async (video: PixabayVideo): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Store in localStorage if not logged in
      const historyStr = localStorage.getItem('video_history') || '[]';
      let history;
      
      try {
        history = JSON.parse(historyStr);
      } catch (e) {
        history = [];
      }
      
      // Add to history if not already in it
      if (!history.some((v: any) => v.id === video.id)) {
        history.unshift({
          id: video.id,
          timestamp: new Date().toISOString()
        });
        
        // Limit history size
        if (history.length > 100) {
          history.pop();
        }
        
        localStorage.setItem('video_history', JSON.stringify(history));
      }
    } else {
      // Store in Supabase if logged in
      await supabase
        .from('video_history')
        .upsert(
          {
            user_id: user.id,
            video_id: video.id.toString(),
            viewed_at: new Date()
          },
          { onConflict: 'user_id,video_id' }
        );
    }
  } catch (error) {
    console.error('Error recording video view:', error);
  }
};

// Counter for tracking video views for ads
let videoViewCount = 0;

// Increment video view count and return true if ad should be shown
export const incrementVideoViews = (): boolean => {
  videoViewCount = (videoViewCount + 1) % 5;
  return videoViewCount === 0; // Show ad every 5 videos
};

// Popular video categories
export const getPopularCategories = (): string[] => {
  return [
    'nature',
    'travel',
    'animals',
    'people',
    'food',
    'sports',
    'technology',
    'backgrounds',
    'business',
    'music',
    'animation'
  ];
};
