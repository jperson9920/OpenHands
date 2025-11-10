import React, { useState, useEffect } from 'react';
import ApiService from './services/api';
import SocketService from './services/socket';
import AgentTimeline from './components/AgentTimeline';
import DelegationView from './components/DelegationView';
import WorkspaceView from './components/WorkspaceView';
import ActionLog from './components/ActionLog';

const API_URL = process.env.REACT_APP_OPENHANDS_API_URL || 'http://localhost:3000';

export default function App() {
  const [actions, setActions] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [delegations, setDelegations] = useState([]);
  const [activeView, setActiveView] = useState('timeline');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    ApiService.setBase(API_URL);
    SocketService.connect(API_URL);

    SocketService.on('connect', () => {
      setConnectionStatus('connected');
      loadCurrentTask();
    });

    SocketService.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    SocketService.on('action_update', (data) => {
      setActions(prev => [...prev, data]);
      if (data.action === 'AgentDelegateAction') {
        setDelegations(prev => [...prev, {
          id: data.id,
          agent: data.agent,
          task: data.inputs,
          status: 'active',
          timestamp: new Date()
        }]);
      }
      if (data.action === 'AgentFinishAction' && data.delegate_level > 0) {
        setDelegations(prev => prev.map(d => d.id === data.delegation_id ? { ...d, status: 'completed' } : d));
      }
    });

    return () => SocketService.disconnect();
  }, []);

  const loadCurrentTask = async () => {
    try {
      const t = await ApiService.get('/api/tasks/current');
      setCurrentTask(t);
      setActions(t.actions || []);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="p-4 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">OpenHands Dashboard</h1>
          <span className={`px-2 py-1 rounded text-sm ${connectionStatus === 'connected' ? 'bg-green-700' : 'bg-red-700'}`}>
            {connectionStatus}
          </span>
        </div>
        <nav className="flex gap-2">
          <button onClick={() => setActiveView('timeline')} className="px-3 py-1 rounded bg-slate-800">Agent Timeline</button>
          <button onClick={() => setActiveView('delegations')} className="px-3 py-1 rounded bg-slate-800">Delegations</button>
          <button onClick={() => setActiveView('workspace')} className="px-3 py-1 rounded bg-slate-800">Workspace</button>
          <button onClick={() => setActiveView('logs')} className="px-3 py-1 rounded bg-slate-800">Action Log</button>
        </nav>
      </header>

      <main className="p-4">
        {activeView === 'timeline' && <AgentTimeline actions={actions} />}
        {activeView === 'delegations' && <DelegationView delegations={delegations} />}
        {activeView === 'workspace' && <WorkspaceView task={currentTask} />}
        {activeView === 'logs' && <ActionLog actions={actions} />}
      </main>
    </div>
  );
}