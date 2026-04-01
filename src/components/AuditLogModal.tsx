import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { Terminal, Download, FileText, ArrowUpDown } from 'lucide-react';
import { Modal } from './Modal';

interface LogEntry {
  timestamp: string;
  sessionId: string;
  type: string;
  payload: any;
  reasoning?: string;
}

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Newest');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/logs').then(res => res.json()).then(setLogs);
    }
  }, [isOpen]);

  const filteredLogs = logs
    .filter(log => filter === 'All' || log.type === filter)
    .sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sort === 'Newest' ? dateB - dateA : dateA - dateB;
    });

  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const date = log.timestamp.split('T')[0];
    if (!acc[date]) acc[date] = {};
    if (!acc[date][log.sessionId]) acc[date][log.sessionId] = [];
    acc[date][log.sessionId].push(log);
    return acc;
  }, {} as Record<string, Record<string, LogEntry[]>>);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Immutable Audit Logs", 10, 10);
    filteredLogs.forEach((log, i) => {
      doc.text(`${log.timestamp} - ${log.type}: ${JSON.stringify(log.payload)}`, 10, 20 + i * 10);
    });
    doc.save("audit_logs.pdf");
  };

  const exportWord = async () => {
    const doc = new Document({
      sections: [{
        children: filteredLogs.map(log => new Paragraph({
          children: [new TextRun(`${log.timestamp} - ${log.type}: ${JSON.stringify(log.payload)}`)],
        })),
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "audit_logs.docx");
  };

  return (
    <Modal id="modal-audit-logs" isOpen={isOpen} onClose={onClose} title={<><Terminal size={20} /> Immutable Audit Logs</>} className="max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <select id="audit-log-filter" onChange={(e) => setFilter(e.target.value)} className="p-2 border rounded bg-white">
            <option>All</option>
            <option>DECISION</option>
            <option>API_CALL</option>
            <option>WEBHOOK</option>
            <option>ERROR</option>
            <option value="LIVE_STREAM">Live Event Streams Logs</option>
          </select>
          <button id="audit-log-sort-btn" onClick={() => setSort(sort === 'Newest' ? 'Oldest' : 'Newest')} className="p-2 border rounded bg-white"><ArrowUpDown size={16} /></button>
          <button id="audit-log-export-pdf-btn" onClick={exportPDF} className="p-2 bg-red-500 text-white rounded flex items-center gap-1"><Download size={16} /> PDF</button>
          <button id="audit-log-export-word-btn" onClick={exportWord} className="p-2 bg-blue-500 text-white rounded flex items-center gap-1"><FileText size={16} /> Word</button>
        </div>
      </div>

      <div id="audit-log-content" className="bg-white rounded-xl shadow p-4 border border-gray-200">
        {Object.entries(groupedLogs).map(([date, sessions]) => (
          <div key={date} className="mb-6">
            <h3 className="text-lg font-semibold bg-gray-100 p-2 rounded">{date}</h3>
            {Object.entries(sessions).map(([sessionId, logs]) => (
              <div key={sessionId} className="ml-4 mb-4 border-l-2 border-[var(--brand-forest-green-600)] pl-4 mt-2">
                <h4 className="font-medium text-sm text-gray-500 mb-2">Session: {sessionId}</h4>
                {logs.map((log, i) => (
                  <div key={i} className="mb-2 p-3 border rounded text-sm bg-gray-50">
                    <p><strong>{new Date(log.timestamp).toLocaleTimeString()}</strong> - <span className="font-bold text-[var(--brand-forest-green-600)]">{log.type}</span></p>
                    <pre className="text-xs bg-white border p-2 mt-1 rounded overflow-x-auto">{JSON.stringify(log.payload, null, 2)}</pre>
                    {log.reasoning && <p className="text-xs mt-2 italic text-gray-600">Reasoning: {log.reasoning}</p>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
        {Object.keys(groupedLogs).length === 0 && <p className="text-center text-gray-500">No logs found.</p>}
      </div>
    </Modal>
  );
};

export default AuditLogModal;
