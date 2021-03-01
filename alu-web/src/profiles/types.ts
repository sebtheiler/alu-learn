export interface MinifiedProfile {
  first_name: string;
  last_name: string;
  username: string;
  id: number;
}

export interface Profile extends MinifiedProfile {
  email: string;
  bio: string;
  friend_count: number;
  is_friend: boolean;
  you_are_pending: boolean;
  settings: Settings;
  badges: Badge[];
  total_thanks_received: number;
  longest_streak: number;
  current_streak: number;
  id: number;
}

export interface Settings {
  disable_all_tooltips: boolean;
  send_reminders: boolean;
  user_type: 'STUDENT' | 'TEACHER';
  ideal_time_per_day: 'MAX' | '20' | '15' | '10' | '5';
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
  date: Date;
  cardsDone: number;
  timeSpent: number;
}