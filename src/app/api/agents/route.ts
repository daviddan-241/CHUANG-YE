import { NextRequest, NextResponse } from 'next/server';
import { getAgentSystem } from '@/lib/agents/agent-system';

export async function GET(request: NextRequest) {
  try {
    const system = getAgentSystem();
    const agents = system.getAgents();
    const tasks = system.getTasks();
    
    return NextResponse.json({
      success: true,
      agents,
      tasks: {
        pending: tasks.filter(t => t.status === 'pending').length,
        running: tasks.filter(t => t.status === 'running').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: tasks.filter(t => t.status === 'failed').length
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get agents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, agentId, taskType, description, priority } = body;
    
    const system = getAgentSystem();
    
    switch (action) {
      case 'start':
        await system.start();
        return NextResponse.json({ success: true, message: 'Agent system started' });
        
      case 'stop':
        system.stop();
        return NextResponse.json({ success: true, message: 'Agent system stopped' });
        
      case 'toggle':
        const isActive = system.toggleAgent(agentId);
        return NextResponse.json({ success: true, isActive });
        
      case 'add-task':
        const task = system.addTask({
          agentId: agentId || '',
          type: taskType,
          description,
          priority: priority || 'medium'
        });
        return NextResponse.json({ success: true, task });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
