export type VideoCategory = 'Speechcraft' | 'Contest' | 'Club';

export interface Video {
  id: string;
  title: string;
  label: string;
  category: VideoCategory;
  duration: string;
  description: string;
  tags: string[];
  speechcraftNumber?: number;
}

export interface FeedbackPayload {
  videoId: string;
  name?: string;
  rating: number;
  message?: string;
}
