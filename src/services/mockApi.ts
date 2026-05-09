import { User, Idea, Comment, Notification, Campaign } from '../types';

const STORAGE_KEY = 'ideate_pro_data';

interface StorageData {
  ideas: Idea[];
  comments: Comment[];
  notifications: Notification[];
  campaign: Campaign;
  users: User[];
  currentUser: User | null;
}

const INITIAL_DATA: StorageData = {
  campaign: {
    id: 'camp-1',
    name: 'Future City 2030',
    description: 'How can we make our urban environments more sustainable, inclusive, and technologically advanced by the year 2030? Share your boldest ideas!',
    totalIdeas: 3,
    activeUsers: 124
  },
  users: [
    { id: 'u1', name: 'Sarah Chen', email: 'sarah@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { id: 'u2', name: 'James Wilson', email: 'james@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' }
  ],
  currentUser: null,
  ideas: [
    {
      id: 'i1',
      campaignId: 'camp-1',
      userId: 'u1',
      userName: 'Sarah Chen',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      subject: 'Vertical Urban Forests',
      description: 'Integrate high-rise buildings with native floral ecosystems to filter air pollutants and provide local food sources through aeroponics.',
      votes: ['u2', 'u3', 'u4', 'u10', 'u11'],
      commentCount: 1,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'i2',
      campaignId: 'camp-1',
      userId: 'u2',
      userName: 'James Wilson',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
      subject: 'Universal Mesh Network',
      description: 'Deploy a decentralized community-owned internet mesh using recycled hardware to ensure internet access is a basic human right.',
      votes: ['u1', 'u5', 'u12'],
      commentCount: 0,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'i3',
      campaignId: 'camp-1',
      userId: 'u3',
      userName: 'Elena Rodriguez',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
      subject: 'Kinetic Sidewalks',
      description: 'Pave main pedestrian routes with pressure-sensitive tiles that convert footsteps into electrical energy for street lighting.',
      votes: ['u1', 'u2', 'u13', 'u14'],
      commentCount: 0,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      id: 'i4',
      campaignId: 'camp-1',
      userId: 'u4',
      userName: 'David Park',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      subject: 'AI Water Grid',
      description: 'Smart sensors across the city water network to detect micro-leaks and optimize distribution in real-time using historical usage patterns.',
      votes: ['u1', 'u15'],
      commentCount: 0,
      createdAt: new Date(Date.now() - 345600000).toISOString(),
    },
    {
      id: 'i5',
      campaignId: 'camp-1',
      userId: 'u5',
      userName: 'Amara Okafor',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amara',
      subject: 'Modular Housing Kits',
      description: 'Standardized, eco-friendly modular components that communities can assemble into affordable housing with minimal technical training.',
      votes: ['u1', 'u2', 'u3', 'u16'],
      commentCount: 0,
      createdAt: new Date(Date.now() - 432000000).toISOString(),
    },
    {
      id: 'i6',
      campaignId: 'camp-1',
      userId: 'u6',
      userName: 'Leo Schmidt',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
      subject: 'Smart Waste Sorting',
      description: 'AI-powered disposal units that automatically sort recyclable materials and provide credits to citizens for correct usage.',
      votes: ['u2'],
      commentCount: 0,
      createdAt: new Date(Date.now() - 518400000).toISOString(),
    }
  ],
  comments: [
    {
      id: 'c1',
      ideaId: 'i1',
      userId: 'u2',
      userName: 'James Wilson',
      content: 'This could radically solve the urban heat island effect too!',
      createdAt: new Date(Date.now() - 43200000).toISOString()
    }
  ],
  notifications: []
};

class MockApiService {
  private data: StorageData;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    this.data = saved ? JSON.parse(saved) : INITIAL_DATA;
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  // Auth
  async login(email: string): Promise<User> {
    // Mocking email check logic
    let user = this.data.users.find(u => u.email === email);
    if (!user) {
      user = {
        id: `u-${Math.random().toString(36).substr(2, 9)}`,
        email,
        name: email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      };
      this.data.users.push(user);
    }
    this.data.currentUser = user;
    this.save();
    return user;
  }

  async logout() {
    this.data.currentUser = null;
    this.save();
  }

  getCurrentUser(): User | null {
    return this.data.currentUser;
  }

  // Campaign
  async getCampaign(): Promise<Campaign> {
    return this.data.campaign;
  }

  // Ideas
  async getIdeas(search?: string, page: number = 1): Promise<{ ideas: Idea[], total: number }> {
    let filtered = [...this.data.ideas];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(i => 
        i.subject.toLowerCase().includes(q) || 
        i.description.toLowerCase().includes(q)
      );
    }
    
    // Sort by votes count desc
    filtered.sort((a, b) => b.votes.length - a.votes.length);
    
    const limit = 5;
    const offset = (page - 1) * limit;
    return {
      ideas: filtered.slice(offset, offset + limit),
      total: filtered.length
    };
  }

  async addIdea(subject: string, description: string): Promise<Idea> {
    if (!this.data.currentUser) throw new Error('Unauthorized');
    const newIdea: Idea = {
      id: `i-${Math.random().toString(36).substr(2, 9)}`,
      campaignId: this.data.campaign.id,
      userId: this.data.currentUser.id,
      userName: this.data.currentUser.name,
      userAvatar: this.data.currentUser.avatar,
      subject,
      description,
      votes: [],
      commentCount: 0,
      createdAt: new Date().toISOString()
    };
    this.data.ideas.unshift(newIdea);
    this.data.campaign.totalIdeas++;
    this.save();
    return newIdea;
  }

  async updateIdea(id: string, subject: string, description: string): Promise<Idea> {
    const idx = this.data.ideas.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Not found');
    this.data.ideas[idx] = { ...this.data.ideas[idx], subject, description };
    this.save();
    return this.data.ideas[idx];
  }

  async toggleVote(ideaId: string): Promise<Idea> {
    if (!this.data.currentUser) throw new Error('Unauthorized');
    const idea = this.data.ideas.find(i => i.id === ideaId);
    if (!idea) throw new Error('Not found');
    
    const voteIdx = idea.votes.indexOf(this.data.currentUser.id);
    if (voteIdx === -1) {
      idea.votes.push(this.data.currentUser.id);
    } else {
      idea.votes.splice(voteIdx, 1);
    }
    this.save();
    return idea;
  }

  // Comments & Notifications
  async getComments(ideaId: string): Promise<Comment[]> {
    return this.data.comments.filter(c => c.ideaId === ideaId);
  }

  async addComment(ideaId: string, content: string): Promise<Comment> {
    if (!this.data.currentUser) throw new Error('Unauthorized');
    const idea = this.data.ideas.find(i => i.id === ideaId);
    if (!idea) throw new Error('Not found');

    const newComment: Comment = {
      id: `c-${Math.random().toString(36).substr(2, 9)}`,
      ideaId,
      userId: this.data.currentUser.id,
      userName: this.data.currentUser.name,
      userAvatar: this.data.currentUser.avatar,
      content,
      createdAt: new Date().toISOString()
    };
    this.data.comments.push(newComment);
    idea.commentCount++;

    // Notification for original poster
    if (idea.userId !== this.data.currentUser.id) {
      this.data.notifications.unshift({
        id: `n-${Date.now()}`,
        userId: idea.userId,
        message: `${this.data.currentUser.name} commented on your idea: "${idea.subject}"`,
        ideaId,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    this.save();
    return newComment;
  }

  async getNotifications(): Promise<Notification[]> {
    if (!this.data.currentUser) return [];
    return this.data.notifications.filter(n => n.userId === this.data.currentUser?.id);
  }

  async markNotificationsRead() {
    if (!this.data.currentUser) return;
    this.data.notifications.forEach(n => {
      if (n.userId === this.data.currentUser?.id) n.isRead = true;
    });
    this.save();
  }
}

export const mockApi = new MockApiService();
