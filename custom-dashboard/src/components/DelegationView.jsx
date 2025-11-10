import React from 'react';

export default function DelegationView({ delegations = [] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Delegations</h2>
      {delegations.length === 0 && (
        <div className="text-sm text-slate-400">No delegations yet.</div>
      )}
      <div className="flex flex-col gap-3">
        {delegations.map((d, i) => (
          <div key={d.id || i} className="p-3 rounded-md bg-slate-800">
            <div className="flex justify-between">
              <div className="font-medium">{d.agent || 'unknown agent'}</div>
              <div className="text-xs text-slate-400">
                {d.timestamp ? new Date(d.timestamp).toLocaleString() : ''}
              </div>
            </div>
            <div className="mt-2 text-sm text-slate-200">
              <div><strong>Task:</strong> {typeof d.task === 'string' ? d.task : JSON.stringify(d.task)}</div>
              <div className="mt-2 text-xs">
                <strong>Status:</strong> <span className={d.status === 'completed' ? 'text-green-400' : 'text-yellow-300'}>{d.status || 'active'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}