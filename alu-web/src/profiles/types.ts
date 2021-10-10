export interface MinifiedProfile {
  first_name: string;
  last_name: string;
  username: string;
  id: number;
}

export interface Profile extends MinifiedProfile {
  bio: string;
  friend_count: number;
  is_friend: boolean;
  you_are_pending: boolean;
  settings: Settings;
  badges: Badge[];
  longest_streak: number;
  current_streak: number;
  id: number;
}

export interface Settings {
  send_reminders: boolean;
  user_type: 'STUDENT' | 'TEACHER' | 'MIXED';
  target_num_cards: number;
  is_opted_dev: boolean;
  id: number;
}

export interface Badge {
  chosen: boolean;
  identifier: string;
  id: number;
}

export interface Notification {
  title: string;
  description: string;
  read: boolean;
  category: 'basic' | 'friend_request';
  username: string;
  timestamp: string;
  id: number;
}

export interface ProfileHistory {
  date: string;
  cards_done: number;
  time_spent: number;
  habits_done: number;
}