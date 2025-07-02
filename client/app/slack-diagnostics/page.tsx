'use client';
import { useAuth } from '../context/AuthProvider';
import { useState } from 'react';

export default function SlackDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const runDiagnostics = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/slack/diagnostics', {
        headers: { 'x-user-id': user.id },
      });
      const data = await res.json();
      setDiagnostics(data);
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h2 className="text-xl font-bold mb-4">Slack Token Diagnostics</h2>
      
      <button 
        onClick={runDiagnostics}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {loading ? 'Running...' : 'Run Diagnostics'}
      </button>

      {diagnostics && (
        <div className="mt-4">
          <pre className="bg-white p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
