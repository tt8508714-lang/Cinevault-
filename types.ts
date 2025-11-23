export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Movie {
  id: string;
  title: string;
  year: string;
  rating: string;
  genre: string;
  posterUrl: string;
  synopsis: string;
  director?: string;
  cast?: string[];
  trivia?: string;
  trailerUrl?: string; // Can be a URL string or a Blob URL
  isLocalVideo?: boolean; // Flag to identify if it's a local file upload
  reviews?: Review[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  role: 'user' | 'admin';
  joinedAt?: string;
  status?: 'active' | 'banned';
  // New fields for Manual Verification
  paymentStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  paymentProof?: {
    transactionId: string;
    screenshotUrl: string;
  };
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index
  explanation: string;
}

export type Tab = 'home' | 'picks' | 'quiz' | 'profile';