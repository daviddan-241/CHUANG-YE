import { EventEmitter } from 'events';

export interface Agent {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  experience: string;
  personality: string;
  avatar: string;
  isActive: boolean;
  currentTask: string | null;
  completedTasks: number;
  successRate: number;
}

export interface AgentTask {
  id: string;
  agentId: string;
  type: 'content' | 'engagement' | 'dm' | 'analysis' | 'growth' | 'monetization';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  createdAt: Date;
  completedAt?: Date;
}

const AGENTS: Agent[] = [
  {
    id: 'content-king',
    name: 'Content King',
    role: 'Chief Content Strategist',
    expertise: ['viral hooks', 'carousel design', 'thread writing', 'storytelling'],
    experience: '12 years in social media marketing, managed accounts with 500K+ followers',
    personality: 'Creative, trend-obsessed, data-driven. Knows what makes content go viral.',
    avatar: '👑',
    isActive: true,
    currentTask: null,
    completedTasks: 0,
    successRate: 94
  },
  {
    id: 'engagement-beast',
    name: 'Engagement Beast',
    role: 'Community Growth Manager',
    expertise: ['comment strategy', 'DM outreach', 'community building', 'collab outreach'],
    experience: '8 years growing communities from 0 to 100K. Expert in Chinese and English markets.',
    personality: 'Energetic, relationship-builder, knows how to trigger engagement.',
    avatar: '🦁',
    isActive: true,
    currentTask: null,
    completedTasks: 0,
    successRate: 89
  },
  {
    id: 'revenue-hacker',
    name: 'Revenue Hacker',
    role: 'Monetization Specialist',
    expertise: ['funnel design', 'pricing strategy', 'upselling', 'payment optimization'],
    experience: 'Generated $2M+ in digital product sales. Expert in WeChat Pay and Stripe.',
    personality: 'Analytical, conversion-focused, knows the psychology of buying.',
    avatar: '💰',
    isActive: true,
    currentTask: null,
    completedTasks: 0,
    successRate: 91
  },
  {
    id: 'trend-scout',
    name: 'Trend Scout',
    role: 'Trend Analyst',
    expertise: ['trend prediction', 'viral timing', 'hashtag research', 'competitor analysis'],
    experience: 'Former social media analyst at top agency. Spots trends 48 hours before they blow up.',
    personality: 'Observant, quick-thinking, always 3 steps ahead.',
    avatar: '🔭',
    isActive: true,
    currentTask: null,
    completedTasks: 0,
    successRate: 87
  },
  {
    id: 'image-architect',
    name: 'Image Architect',
    role: 'Visual Content Director',
    expertise: ['photo direction', 'AI image prompting', 'carousel design', 'brand consistency'],
    experience: 'Award-winning designer. Created visuals for brands with 1M+ followers.',
    personality: 'Detail-oriented, aesthetic-obsessed, knows what stops the scroll.',
    avatar: '🎨',
    isActive: true,
    currentTask: null,
    completedTasks: 0,
    successRate: 96
  },
  {
    id: 'copy-ninja',
    name: 'Copy Ninja',
    role: 'Copywriting Lead',
    expertise: ['persuasive copy', 'CTA optimization', 'A/B testing', 'voice matching'],
    experience: '15 years copywriting. Wrote campaigns that converted at 12%+.',
    personality: 'Wordsmith, psychology expert, makes every character count.',
    avatar: '🥷',
    isActive: true,
    currentTask: null,
    completedTasks: 0,
    successRate: 93
  },
  {
    id: 'china-whisperer',
    name: 'China Whisperer',
    role: 'Chinese Market Specialist',
    expertise: ['Xiaohongshu growth', 'WeChat marketing', 'Douyin strategy', 'Chinese copywriting'],
    experience: 'Native Chinese marketer. Built 5 accounts to 100K+ on RED.',
    personality: 'Cultural bridge, understands Chinese consumer psychology.',
    avatar: '🐉',
    isActive: true,
    currentTask: null,
    completedTasks: 0,
    successRate: 92
  },
  {
    id: 'automation-guru',
    name: 'Automation Guru',
    role: 'Technical Operations Lead',
    expertise: ['browser automation', 'API integration', 'workflow optimization', 'anti-detection'],
    experience: 'Full-stack engineer. Built automation systems processing 10K+ actions/day.',
    personality: 'Systematic, efficiency-obsessed, makes machines do the work.',
    avatar: '⚙️',
    isActive: true,
    currentTask: null,
    completedTasks: 0,
    successRate: 95
  }
];

export class AgentSystem extends EventEmitter {
  private agents: Map<string, Agent> = new Map();
  private taskQueue: AgentTask[] = [];
  private isRunning: boolean = false;

  constructor() {
    super();
    
    // Initialize agents
    for (const agent of AGENTS) {
      this.agents.set(agent.id, agent);
    }
  }

  async start(): Promise<void> {
    console.log('🤖 Starting Agent System...');
    console.log(`  Loaded ${this.agents.size} agents`);
    
    this.isRunning = true;
    
    // Start task processing loop
    this.processTaskQueue();
    
    this.emit('started');
  }

  private async processTaskQueue(): Promise<void> {
    while (this.isRunning) {
      if (this.taskQueue.length > 0) {
        // Find next task
        const task = this.taskQueue.find(t => t.status === 'pending');
        
        if (task) {
          // Find best agent for task
          const agent = this.findBestAgent(task.type);
          
          if (agent) {
            await this.assignTask(agent, task);
          }
        }
      }
      
      await this.delay(1000);
    }
  }

  private findBestAgent(taskType: string): Agent | null {
    const availableAgents = Array.from(this.agents.values())
      .filter(a => a.isActive && !a.currentTask);
    
    if (availableAgents.length === 0) return null;
    
    // Match agent expertise to task type
    const expertiseMap: Record<string, string[]> = {
      'content': ['viral hooks', 'carousel design', 'thread writing', 'storytelling', 'persuasive copy'],
      'engagement': ['comment strategy', 'DM outreach', 'community building', 'collab outreach'],
      'dm': ['DM outreach', 'persuasive copy', 'CTA optimization'],
      'analysis': ['trend prediction', 'viral timing', 'hashtag research', 'competitor analysis'],
      'growth': ['community building', 'Xiaohongshu growth', 'WeChat marketing', 'Douyin strategy'],
      'monetization': ['funnel design', 'pricing strategy', 'upselling', 'payment optimization']
    };
    
    const requiredExpertise = expertiseMap[taskType] || [];
    
    // Score agents based on expertise match
    const scoredAgents = availableAgents.map(agent => {
      const matchCount = agent.expertise.filter(e => requiredExpertise.includes(e)).length;
      return { agent, score: matchCount + (agent.successRate / 100) };
    });
    
    // Return highest scoring agent
    scoredAgents.sort((a, b) => b.score - a.score);
    return scoredAgents[0]?.agent || null;
  }

  private async assignTask(agent: Agent, task: AgentTask): Promise<void> {
    console.log(`📋 Assigning task "${task.description}" to ${agent.name}`);
    
    agent.currentTask = task.id;
    task.status = 'running';
    
    this.emit('taskStarted', { agent, task });
    
    // Simulate task execution
    try {
      const result = await this.executeTask(agent, task);
      
      task.status = 'completed';
      task.result = result;
      task.completedAt = new Date();
      
      agent.currentTask = null;
      agent.completedTasks++;
      
      console.log(`✅ ${agent.name} completed: ${task.description}`);
      this.emit('taskCompleted', { agent, task });
      
    } catch (error) {
      task.status = 'failed';
      task.result = { error: error instanceof Error ? error.message : 'Unknown error' };
      
      agent.currentTask = null;
      
      console.log(`❌ ${agent.name} failed: ${task.description}`);
      this.emit('taskFailed', { agent, task });
    }
  }

  private async executeTask(agent: Agent, task: AgentTask): Promise<any> {
    // Simulate task execution based on type
    await this.delay(Math.random() * 5000 + 2000);
    
    switch (task.type) {
      case 'content':
        return this.generateContent(agent, task);
      case 'engagement':
        return this.performEngagement(agent, task);
      case 'dm':
        return this.handleDM(agent, task);
      case 'analysis':
        return this.analyzeTrends(agent, task);
      case 'growth':
        return this.executeGrowthStrategy(agent, task);
      case 'monetization':
        return this.optimizeMonetization(agent, task);
      default:
        return { success: true, message: 'Task completed' };
    }
  }

  private async generateContent(agent: Agent, task: AgentTask): Promise<any> {
    return {
      type: 'content',
      variations: 3,
      platforms: ['twitter', 'instagram', 'xiaohongshu'],
      estimatedEngagement: Math.floor(Math.random() * 5000) + 1000
    };
  }

  private async performEngagement(agent: Agent, task: AgentTask): Promise<any> {
    return {
      type: 'engagement',
      likes: Math.floor(Math.random() * 50) + 10,
      comments: Math.floor(Math.random() * 20) + 5,
      follows: Math.floor(Math.random() * 30) + 10
    };
  }

  private async handleDM(agent: Agent, task: AgentTask): Promise<any> {
    return {
      type: 'dm',
      repliesSent: Math.floor(Math.random() * 10) + 1,
      followUpsScheduled: Math.floor(Math.random() * 5) + 1
    };
  }

  private async analyzeTrends(agent: Agent, task: AgentTask): Promise<any> {
    return {
      type: 'analysis',
      trendsFound: Math.floor(Math.random() * 10) + 5,
      opportunities: Math.floor(Math.random() * 3) + 1
    };
  }

  private async executeGrowthStrategy(agent: Agent, task: AgentTask): Promise<any> {
    return {
      type: 'growth',
      newFollowers: Math.floor(Math.random() * 200) + 50,
      engagementIncrease: Math.floor(Math.random() * 20) + 5
    };
  }

  private async optimizeMonetization(agent: Agent, task: AgentTask): Promise<any> {
    return {
      type: 'monetization',
      conversions: Math.floor(Math.random() * 5) + 1,
      revenue: Math.floor(Math.random() * 2000) + 500
    };
  }

  addTask(task: Omit<AgentTask, 'id' | 'status' | 'createdAt'>): AgentTask {
    const newTask: AgentTask = {
      ...task,
      id: `task-${Date.now()}`,
      status: 'pending',
      createdAt: new Date()
    };
    
    this.taskQueue.push(newTask);
    this.emit('taskAdded', newTask);
    
    return newTask;
  }

  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getActiveAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.isActive);
  }

  getTasks(): AgentTask[] {
    return this.taskQueue;
  }

  getPendingTasks(): AgentTask[] {
    return this.taskQueue.filter(t => t.status === 'pending');
  }

  getRunningTasks(): AgentTask[] {
    return this.taskQueue.filter(t => t.status === 'running');
  }

  toggleAgent(id: string): boolean {
    const agent = this.agents.get(id);
    if (agent) {
      agent.isActive = !agent.isActive;
      return agent.isActive;
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop(): void {
    this.isRunning = false;
    console.log('🛑 Agent System stopped');
  }
}

// Singleton instance
let agentSystemInstance: AgentSystem | null = null;

export function getAgentSystem(): AgentSystem {
  if (!agentSystemInstance) {
    agentSystemInstance = new AgentSystem();
  }
  return agentSystemInstance;
}
