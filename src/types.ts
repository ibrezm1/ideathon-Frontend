export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Idea {
  id: string;
  campaignId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  subject: string;
  description: string;
  votes: string[]; // List of user IDs
  commentCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  ideaId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  ideaId: string;
  isRead: boolean;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  totalIdeas: number;
  activeUsers: number;
}
