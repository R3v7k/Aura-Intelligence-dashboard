import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Activity, Zap, Database, Shield, FileJson, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';

interface ObservabilityNexusProps {
  isOpen: boolean;
  onClose: () => void;
  webhookStatus: string;
  events: string[];
  logs: string[];
  lastPayload: string;
  customerState: any;
  telemetry: any;
  executeLiveCartAbandonment: () => void;
  simulatePaymentFailure: () => void;
  executeLiveSmsFallback: () => void;
  clearEvents: () => void;
}

export const ObservabilityNexus: React.FC<ObservabilityNexusProps> = ({
  isOpen,
  onClose,
  webhookStatus,
  events,
  logs,
  lastPayload,
  customerState,
  telemetry,
  executeLiveCartAbandonment,
  simulatePaymentFailure,
  executeLiveSmsFallback,
  clearEvents
}) => {
  const [isPayloadCollapsed, setIsPayloadCollapsed] = useState(false);
  const [metricsFilter, setMetricsFilter] = useState('latency');
  const [webhookStream, setWebhookStream] = useState<any[]>([]);
  
  // Mock time-series data for OTel metrics
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);

  const handleClearScreen = async () => {
    // 1. Sync logs to backend
    if (events.length > 0 || webhookStream.length > 0) {
      try {
        await fetch('/api/logs/live-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events, webhookStream })
        });
      } catch (error) {
        console.error('Failed to sync live stream logs', error);
      }
    }
    // 2. Clear local UI state
    clearEvents();
    setWebhookStream([]);
    
    // 3. Force re-fetch of stream to ensure UI is updated
    try {
      const res = await fetch('/api/webhookStream');
      const data = await res.json();
      if (data && data.data) {
        setWebhookStream(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch webhook stream", e);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen) {
      // Initialize with some baseline data
      const initialData = Array.from({ length: 10 }).map((_, i) => ({
        time: new Date(Date.now() - (10 - i) * 1000).toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit' }),
        latency: Math.floor(Math.random() * 50) + 100,
        successRate: 99.9,
        errorRate: 0.1
      }));
      setTimeSeriesData(initialData);

      const fetchStream = async () => {
        try {
          const res = await fetch('/api/webhookStream');
          const data = await res.json();
          if (data && data.data) {
            setWebhookStream(data.data);
          }
        } catch (e) {
          console.error("Failed to fetch webhook stream", e);
        }
      };
      
      fetchStream();
      interval = setInterval(fetchStream, 5000);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  // Simulate live data updates when events happen
  useEffect(() => {
    if (events.length > 0 && isOpen) {
      const newDataPoint = {
        time: new Date().toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit' }),
        latency: Math.floor(Math.random() * 100) + 200, // Spike latency on event
        successRate: telemetry.sent > 0 ? (telemetry.delivered / telemetry.sent) * 100 : 100,
        errorRate: 0
      };
      setTimeSeriesData(prev => [...prev.slice(-9), newDataPoint]);
    }
  }, [events, telemetry, isOpen]);

  const stateEngineData = [
    { name: 'Engagement', value: customerState.engagementScore, fill: '#0b996f' },
    { name: 'Conversion', value: customerState.likelihoodToConvert, fill: '#6366f1' }
  ];

  return (
    <Modal id="modal-observability-nexus" isOpen={isOpen} onClose={onClose} title={<><Activity size={20} /> Observability Nexus</>} className="max-w-[95vw] w-full h-[90vh]">
      <div className="h-full flex flex-col gap-4">
        
        {/* Top Control Bar */}
        <div id="nexus-control-bar" className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-[var(--brand-charcoal-grey-75)]">
          <button id="btn-trigger-cart-abandonment" onClick={executeLiveCartAbandonment} className="flex-1 p-3 bg-[var(--brand-charcoal-grey-900)] text-[var(--brand-cream-100)] rounded-xl hover:bg-[var(--brand-charcoal-grey-800)] font-medium transition-colors">
            Trigger Cart Abandonment
          </button>
          <button id="btn-simulate-payment-failure" onClick={simulatePaymentFailure} className="flex-1 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 font-medium transition-colors">
            Simulate Payment Failure
          </button>
          <button id="btn-trigger-sms-fallback" onClick={executeLiveSmsFallback} className="flex-1 p-3 bg-[var(--brand-charcoal-grey-900)] text-[var(--brand-cream-100)] rounded-xl hover:bg-[var(--brand-charcoal-grey-800)] font-medium transition-colors">
            Trigger SMS Fallback
          </button>
        </div>

        {/* CSS Grid Layout */}
        <div id="nexus-grid" className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
          
          {/* Column 1: Ingest */}
          <div id="nexus-col-ingest" className="flex flex-col gap-4 overflow-hidden">
            <div id="nexus-health-card" className="bg-white p-4 rounded-xl shadow-sm border border-[var(--brand-charcoal-grey-75)] flex-shrink-0">
              <h3 className="text-sm font-bold text-[var(--brand-charcoal-grey-900)] mb-3 flex items-center gap-2"><Activity size={16} className="text-blue-500"/> Health (Ingest)</h3>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[var(--brand-charcoal-grey-700)]">Webhook Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${webhookStatus !== 'Checking...' && !webhookStatus.includes('dead') ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-xs font-semibold text-[var(--brand-charcoal-grey-700)]">
                    {webhookStatus !== 'Checking...' && !webhookStatus.includes('dead') ? 'Active' : 'Healing'}
                  </span>
                </div>
              </div>
              <code className="block mt-2 p-2 bg-gray-50 rounded border text-[10px] break-all text-[var(--brand-forest-green-700)]">{webhookStatus}</code>
            </div>
            
            <div id="nexus-event-stream-card" className="bg-black p-4 rounded-xl shadow-sm border border-gray-800 flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Zap size={16} className="text-yellow-500"/> Live Event Stream</h3>
                <button 
                  onClick={handleClearScreen}
                  className="text-[10px] bg-gray-800 hover:bg-gray-700 text-white px-2 py-1 rounded transition-colors"
                >
                  Clear Screen
                </button>
              </div>
              <div id="nexus-event-stream-content" className="flex-1 overflow-y-auto text-xs font-mono bg-black p-3 rounded-lg border border-gray-800">
                {webhookStream.length === 0 && events.length === 0 ? (
                  <span className="text-gray-500">No events recorded yet.</span>
                ) : (
                  <>
                    {events.map((e, i) => <p key={`local-${i}`} className="mb-1 text-green-400">{e}</p>)}
                    {webhookStream.map((req, i) => (
                      <div key={`wh-${i}`} className="mb-2 border-b border-gray-800 pb-2">
                        <p className="font-bold text-blue-500">[{new Date(req.created_at).toLocaleTimeString()}] {req.method} {req.ip}</p>
                        <pre className="whitespace-pre-wrap break-all mt-1 text-[10px] text-blue-400">{req.content || JSON.stringify(req.query, null, 2)}</pre>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Analyze */}
          <div id="nexus-col-analyze" className="flex flex-col gap-4 overflow-hidden">
            <div id="nexus-state-engine-card" className="bg-white p-4 rounded-xl shadow-sm border border-[var(--brand-charcoal-grey-75)] flex-shrink-0 h-48">
              <h3 className="text-sm font-bold text-[var(--brand-charcoal-grey-900)] mb-2 flex items-center gap-2"><Settings size={16} className="text-gray-500"/> State Engine (Behavioral Twin)</h3>
              <div className="h-full w-full flex items-center justify-center -mt-4 min-h-[150px] min-w-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="100%" barSize={15} data={stateEngineData}>
                    <RadialBar background dataKey="value" />
                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ fontSize: '10px', right: 0 }} />
                    <Tooltip contentStyle={{ fontSize: '12px' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div id="nexus-decision-log-card" className="bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-700 flex-1 flex flex-col min-h-0">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Shield size={16} className="text-green-500"/> AI Decision Log</h3>
              <div id="nexus-decision-log-content" className="flex-1 overflow-y-auto font-mono text-xs text-green-400 bg-gray-900 p-3 rounded-lg border border-gray-700">
                {logs.length === 0 ? <span className="text-gray-500">No decisions logged yet.</span> : logs.map((l, i) => <p key={i} className="mb-2">{l}</p>)}
              </div>
            </div>
          </div>

          {/* Column 3: Execute */}
          <div id="nexus-col-execute" className="flex flex-col gap-4 overflow-hidden">
            <div id="nexus-otel-metrics-card" className="bg-white p-4 rounded-xl shadow-sm border border-[var(--brand-charcoal-grey-75)] flex-shrink-0 h-48 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-[var(--brand-charcoal-grey-900)] flex items-center gap-2"><Database size={16} className="text-purple-500"/> OTel Metrics</h3>
                <select 
                  id="select-metrics-filter"
                  value={metricsFilter} 
                  onChange={(e) => setMetricsFilter(e.target.value)}
                  className="text-xs p-1 border rounded bg-gray-50 text-gray-700"
                >
                  <option value="latency">Delivery Latency</option>
                  <option value="success">Success Rate</option>
                  <option value="errors">API Errors</option>
                </select>
              </div>
              <div className="flex-1 w-full min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    {metricsFilter === 'latency' && <Line type="monotone" dataKey="latency" stroke="#8b5cf6" strokeWidth={2} dot={false} isAnimationActive={false} />}
                    {metricsFilter === 'success' && <Line type="monotone" dataKey="successRate" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />}
                    {metricsFilter === 'errors' && <Line type="monotone" dataKey="errorRate" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div id="nexus-payload-execution-card" className="bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-700 flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><FileJson size={16} className="text-orange-500"/> Payload Execution</h3>
                <button id="btn-toggle-payload-collapse" onClick={() => setIsPayloadCollapsed(!isPayloadCollapsed)} className="text-gray-400 hover:text-white">
                  {isPayloadCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
              </div>
              <div id="nexus-payload-content" className={`flex-1 overflow-y-auto bg-gray-900 p-3 rounded-lg border border-gray-700 transition-all ${isPayloadCollapsed ? 'max-h-12' : ''}`}>
                <pre className="text-[10px] font-mono whitespace-pre-wrap text-green-400">
                  {lastPayload || "No payload captured yet."}
                </pre>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Modal>
  );
};
