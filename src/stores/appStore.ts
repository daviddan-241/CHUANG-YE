import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  displayName: string;
  avatar: string;
  isActive: boolean;
  isConnected: boolean;
  lastActive: Date | null;
  sessionId: string | null;
}

export interface Post {
  id: string;
  content: string;
  platform: string;
  accountId: string;
  imageId: string | null;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  scheduledAt: Date | null;
  postedAt: Date | null;
  engagement: {
    likes: number;
    retweets: number;
    replies: number;
    views: number;
  };
}

export interface ActivityLog {
  id: string;
  action: string;
  platform: string | null;
  accountId: string | null;
  details: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: Date;
}

export interface AppState {
  // User
  userId: string | null;
  userName: string | null;
  
  // Accounts
  accounts: SocialAccount[];
  selectedAccountId: string | null;
  
  // Posts
  posts: Post[];
  
  // Logs
  logs: ActivityLog[];
  
  // UI State
  sidebarCollapsed: boolean;
  activeTab: string;
  isLoading: boolean;
  isAutomationRunning: boolean;
  
  // Settings
  autoPostEnabled: boolean;
  autoReplyEnabled: boolean;
  engagementBoostEnabled: boolean;
  maxPostsPerDay: number;
  postingFrequency: number; // hours
  
  // Actions
  setUserId: (id: string) => void;
  setUserName: (name: string) => void;
  addAccount: (account: SocialAccount) => void;
  removeAccount: (id: string) => void;
  updateAccount: (id: string, updates: Partial<SocialAccount>) => void;
  setSelectedAccount: (id: string | null) => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  removePost: (id: string) => void;
  addLog: (log: ActivityLog) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveTab: (tab: string) => void;
  setIsLoading: (loading: boolean) => void;
  setIsAutomationRunning: (running: boolean) => void;
  toggleAutoPost: () => void;
  toggleAutoReply: () => void;
  toggleEngagementBoost: () => void;
  setMaxPostsPerDay: (max: number) => void;
  setPostingFrequency: (frequency: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      userId: null,
      userName: null,
      accounts: [],
      selectedAccountId: null,
      posts: [],
      logs: [],
      sidebarCollapsed: false,
      activeTab: 'dashboard',
      isLoading: false,
      isAutomationRunning: false,
      autoPostEnabled: false,
      autoReplyEnabled: true,
      engagementBoostEnabled: true,
      maxPostsPerDay: 10,
      postingFrequency: 4,

      // Actions
      setUserId: (id) => set({ userId: id }),
      setUserName: (name) => set({ userName: name }),
      
      addAccount: (account) => set((state) => ({
        accounts: [...state.accounts, account]
      })),
      
      removeAccount: (id) => set((state) => ({
        accounts: state.accounts.filter(a => a.id !== id),
        selectedAccountId: state.selectedAccountId === id ? null : state.selectedAccountId
      })),
      
      updateAccount: (id, updates) => set((state) => ({
        accounts: state.accounts.map(a => 
          a.id === id ? { ...a, ...updates } : a
        )
      })),
      
      setSelectedAccount: (id) => set({ selectedAccountId: id }),
      
      addPost: (post) => set((state) => ({
        posts: [post, ...state.posts]
      })),
      
      updatePost: (id, updates) => set((state) => ({
        posts: state.posts.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      })),
      
      removePost: (id) => set((state) => ({
        posts: state.posts.filter(p => p.id !== id)
      })),
      
      addLog: (log) => set((state) => ({
        logs: [log, ...state.logs].slice(0, 1000) // Keep last 1000 logs
      })),
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setIsAutomationRunning: (running) => set({ isAutomationRunning: running }),
      toggleAutoPost: () => set((state) => ({ autoPostEnabled: !state.autoPostEnabled })),
      toggleAutoReply: () => set((state) => ({ autoReplyEnabled: !state.autoReplyEnabled })),
      toggleEngagementBoost: () => set((state) => ({ engagementBoostEnabled: !state.engagementBoostEnabled })),
      setMaxPostsPerDay: (max) => set({ maxPostsPerDay: max }),
      setPostingFrequency: (frequency) => set({ postingFrequency: frequency }),
    }),
    {
      name: 'dave-social-ai-storage',
      partialize: (state) => ({
        userId: state.userId,
        userName: state.userName,
        accounts: state.accounts,
        selectedAccountId: state.selectedAccountId,
        posts: state.posts,
        sidebarCollapsed: state.sidebarCollapsed,
        autoPostEnabled: state.autoPostEnabled,
        autoReplyEnabled: state.autoReplyEnabled,
        engagementBoostEnabled: state.engagementBoostEnabled,
        maxPostsPerDay: state.maxPostsPerDay,
        postingFrequency: state.postingFrequency,
      }),
    }
  )
);
