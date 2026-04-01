import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { MessageSquare, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatBackup {
  id: string;
  timestamp: string;
  role: string;
  messages: { role: string; content: string }[];
}

interface ChatBackupsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatBackupsModal: React.FC<ChatBackupsModalProps> = ({ isOpen, onClose }) => {
  const [backups, setBackups] = useState<ChatBackup[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<ChatBackup | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/chat/backups').then(res => res.json()).then(data => {
        setBackups(data.sort((a: ChatBackup, b: ChatBackup) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      });
    }
  }, [isOpen]);

  const exportBackup = (backup: ChatBackup) => {
    const content = backup.messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}\n`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-backup-${backup.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal id="modal-chat-backups" isOpen={isOpen} onClose={onClose} title={<><MessageSquare size={20} /> Chat Backups</>} className="max-w-5xl h-[80vh]">
      <div id="chat-backups-container" className="flex h-full gap-4">
        <div id="chat-backups-list" className="w-1/3 bg-white rounded-xl shadow border border-gray-200 overflow-y-auto">
          {backups.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">No backups found.</p>
          ) : (
            backups.map(backup => (
              <div 
                key={backup.id} 
                id={`chat-backup-item-${backup.id}`}
                onClick={() => setSelectedBackup(backup)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedBackup?.id === backup.id ? 'bg-[var(--brand-mint-green-100)] border-l-4 border-l-[var(--brand-forest-green-600)]' : ''}`}
              >
                <p className="font-semibold text-[var(--brand-charcoal-grey-900)]">{new Date(backup.timestamp).toLocaleString()}</p>
                <p className="text-sm text-gray-500">Role: {backup.role}</p>
                <p className="text-xs text-gray-400 mt-1">{backup.messages.length} messages</p>
              </div>
            ))
          )}
        </div>
        <div id="chat-backup-details" className="w-2/3 bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
          {selectedBackup ? (
            <>
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Session: {selectedBackup.id}</h3>
                <button id="chat-backup-export-btn" onClick={() => exportBackup(selectedBackup)} className="flex items-center gap-1 text-sm bg-[var(--brand-forest-green-600)] text-white px-3 py-1 rounded hover:bg-[var(--brand-forest-green-500)]">
                  <Download size={14} /> Export TXT
                </button>
              </div>
              <div id="chat-backup-messages" className="p-4 overflow-y-auto flex-1 bg-[var(--brand-charcoal-grey-25)]">
                {selectedBackup.messages.map((msg, i) => (
                  <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : msg.role === 'system' ? 'text-center' : 'text-left'}`}>
                    <div className={`inline-block p-3 rounded-lg text-sm max-w-[80%] ${
                      msg.role === 'user' 
                        ? 'bg-[var(--brand-iris-purple-500)] text-white' 
                        : msg.role === 'system'
                          ? 'bg-[var(--brand-mint-green-100)] text-[var(--brand-forest-green-700)] border border-[var(--brand-mint-green-300)] w-full text-left'
                          : 'bg-[var(--brand-charcoal-grey-200)] text-[var(--brand-charcoal-grey-900)]'
                    }`}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a backup to view details
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
