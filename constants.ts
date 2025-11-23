import { Movie, UserProfile } from './types';

// Default is now null as we enforce login
export const DEFAULT_USER: UserProfile | null = null;

// Using Picsum/Placehold for zero-maintenance images, seeded for consistency
const getPoster = (seed: string) => `https://picsum.photos/seed/${seed}/300/450`;

// ALL MOVIES DELETED AS REQUESTED - Admin must upload them
export const MOCK_MOVIES: Movie[] = [];

// Mock Users for Admin Panel Visualization
export const MOCK_USERS: UserProfile[] = [
  { id: 'u1', name: 'Ali Khan', email: 'ali@gmail.com', isPremium: true, role: 'user', joinedAt: '2024-01-15', status: 'active' },
  { id: 'u2', name: 'Sara Ahmed', email: 'sara@hotmail.com', isPremium: false, role: 'user', joinedAt: '2024-02-10', status: 'active' },
  { id: 'u3', name: 'Bilal Tech', email: 'bilal@dev.com', isPremium: false, role: 'user', joinedAt: '2024-03-05', status: 'banned' },
];

export const ADMIN_CREDENTIALS = {
  email: 'admin@cinevault.app',
  password: 'Admin@CineVault#2025'
};