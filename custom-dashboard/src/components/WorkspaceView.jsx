import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import Api from '../services/api';

export default function WorkspaceView({ task }) {
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    // fetch file list for current task (best-effort)
    async function loadFiles() {
      try {
        const data = await Api.get('/api/tasks/current/files').catch(() => null);
        if (data && Array.isArray(data)) {
          setFiles(data);
          if (data.length) {
            setSelected(data[0]);
            loadContent(data[0]);
          }
        }
      } catch (e) {
        // ignore
      }
    }
    loadFiles();
  }, [task]);

  async function loadContent(path) {
    try {
      const res = await Api.get(`/api/files?path=${encodeURIComponent(path)}`);
      setContent(res.content || '');
    } catch (e) {
      setContent('// Unable to load file preview');
    }
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-1 bg-slate-800 p-3 rounded">
        <h3 className="font-medium mb-2">Workspace Files</h3>
        {files.length === 0 && <div className="text-sm text-slate-400">No files available.</div>}
        <ul className="text-sm space-y-2">
          {files.map((f) => (
            <li key={f} className="flex items-center justify-between">
              <button
                className={`text-left truncate w-full ${selected === f ? 'text-blue-300' : 'text-slate-200'}`}
                onClick={() => { setSelected(f); loadContent(f); }}
              >
                {f}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="col-span-3 bg-slate-800 p-3 rounded">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">File Preview</h3>
          <div className="text-sm text-slate-400">{selected || 'No file selected'}</div>
        </div>
        <div style={{ height: '60vh' }} className="rounded overflow-hidden border border-slate-700">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={content}
            theme="vs-dark"
            options={{ readOnly: true, minimap: { enabled: false } }}
          />
        </div>
      </div>
    </div>
  );
}