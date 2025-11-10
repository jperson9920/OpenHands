import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer
} from 'recharts';

function getActionIcon(action) {
  switch (action) {
    case 'CmdRunAction': return '💻';
    case 'IPythonRunCellAction': return '🐍';
    case 'FileWriteAction': return '📝';
    case 'FileReadAction': return '📖';
    case 'BrowseURLAction': return '🌐';
    case 'AgentDelegateAction': return '🔀';
    case 'AgentFinishAction': return '✅';
    case 'MessageAction': return '💬';
    default: return '⚙️';
  }
}

function getActionColor(action) {
  if (!action) return 'border-slate-600';
  if (action === 'AgentFinishAction') return 'border-green-500';
  if (action === 'AgentDelegateAction') return 'border-blue-500';
  if (action.includes('File')) return 'border-orange-500';
  if (action.includes('Cmd') || action.includes('Python')) return 'border-purple-500';
  return 'border-slate-600';
}

function toMinuteKey(ts) {
  const d = new Date(ts);
  d.setSeconds(0, 0);
  return d.toISOString();
}

export default function AgentTimeline({ actions = [] }) {
  // Prepare data for small summary charts
  const { actionsPerMinute, delegationCounts } = useMemo(() => {
    const now = Date.now();
    const minutes = 10; // last N minutes
    const minuteBuckets = new Map();

    // initialize buckets
    for (let i = minutes - 1; i >= 0; i--) {
      const t = new Date(now - i * 60_000);
      t.setSeconds(0, 0);
      minuteBuckets.set(t.toISOString(), 0);
    }

    const delCount = {};

    actions.forEach((a) => {
      const ts = a.timestamp ? new Date(a.timestamp).getTime() : now;
      const keyDate = new Date(ts);
      keyDate.setSeconds(0, 0);
      const key = keyDate.toISOString();
      if (minuteBuckets.has(key)) minuteBuckets.set(key, minuteBuckets.get(key) + 1);
      // delegation counts by agent
      if (a.action === 'AgentDelegateAction') {
        const agent = a.agent || 'unknown';
        delCount[agent] = (delCount[agent] || 0) + 1;
      }
    });

    const apm = Array.from(minuteBuckets.entries()).map(([k, v]) => ({ time: k.slice(11,16), count: v }));
    const del = Object.entries(delCount).map(([agent, count]) => ({ agent, count })).sort((a,b) => b.count - a.count).slice(0,8);

    return { actionsPerMinute: apm, delegationCounts: del };
  }, [actions]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">CodeActAgent Activity</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Actions per minute</h3>
            <div className="text-xs text-slate-400">Last 10 min</div>
          </div>
          <div style={{ height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={actionsPerMinute} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: '#94a3b8' }} />
                <YAxis tick={{ fill: '#94a3b8' }} allowDecimals={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#0b1220" />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#60a5fa" fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Delegations</h3>
            <div className="text-xs text-slate-400">Top agents</div>
          </div>
          <div style={{ height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={delegationCounts} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis type="number" tick={{ fill: '#94a3b8' }} />
                <YAxis dataKey="agent" type="category" tick={{ fill: '#94a3b8' }} width={80} />
                <CartesianGrid strokeDasharray="3 3" stroke="#0b1220" />
                <Tooltip />
                <Bar dataKey="count" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {actions.length === 0 && (
          <div className="text-sm text-slate-400">No actions yet.</div>
        )}
        {actions.map((action, idx) => (
          <div key={idx} className={`flex items-start gap-3 p-3 rounded-md bg-slate-800 ${getActionColor(action.action)}`}>
            <div className="w-10 h-10 flex items-center justify-center bg-slate-700 rounded">
              <span className="text-xl">{getActionIcon(action.action)}</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">
                  {action.action || 'UnknownAction'}
                </div>
                <div className="text-xs text-slate-400">
                  {action.timestamp ? new Date(action.timestamp).toLocaleTimeString() : ''}
                </div>
              </div>
              <div className="mt-2 text-sm text-slate-200">
                {action.action === 'CmdRunAction' && action.command && (
                  <pre className="bg-slate-900 p-2 rounded text-xs overflow-x-auto">{action.command}</pre>
                )}
                {action.action === 'FileWriteAction' && action.path && (
                  <div>
                    <div><strong>File:</strong> {action.path}</div>
                    <div className="text-xs text-slate-400">Lines: {action.content ? action.content.split('\n').length : 'N/A'}</div>
                  </div>
                )}
                {action.action === 'AgentDelegateAction' && (
                  <div>
                    <div><strong>Delegated to:</strong> {action.agent || 'unknown'}</div>
                    <div className="text-xs text-slate-400">{action.inputs ? JSON.stringify(action.inputs) : ''}</div>
                  </div>
                )}
                {action.action === 'MessageAction' && action.content && (
                  <div className="whitespace-pre-wrap">{action.content}</div>
                )}
                {!['CmdRunAction','FileWriteAction','AgentDelegateAction','MessageAction'].includes(action.action) && action.observation && (
                  <pre className="bg-slate-900 p-2 rounded text-xs mt-2 overflow-x-auto">{JSON.stringify(action.observation, null, 2)}</pre>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}