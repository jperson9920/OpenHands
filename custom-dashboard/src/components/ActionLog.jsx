import React from 'react';

export default function ActionLog({ actions = [] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Action Log</h2>
      {actions.length === 0 && <div className="text-sm text-slate-400">No actions yet.</div>}
      <div className="flex flex-col gap-2">
        {actions.slice().reverse().map((a, i) => (
          <div key={i} className="p-3 rounded-md bg-slate-800 border border-slate-700">
            <div className="flex justify-between items-start gap-4">
              <div className="text-sm font-medium">{a.action || 'UnknownAction'}</div>
              <div className="text-xs text-slate-400">{a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}</div>
            </div>
            <div className="mt-2 text-sm text-slate-200">
              {a.command && <pre className="bg-slate-900 p-2 rounded text-xs overflow-x-auto">{a.command}</pre>}
              {a.content && <div className="whitespace-pre-wrap">{a.content}</div>}
              {a.observation && (
                <pre className="bg-slate-900 p-2 rounded text-xs mt-2 overflow-x-auto">{JSON.stringify(a.observation, null, 2)}</pre>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}