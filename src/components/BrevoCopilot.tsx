import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Modal } from './Modal';
import { MessageSquare, Save, Loader2, Mic, MicOff } from 'lucide-react';

interface Message {
  role: 'user' | 'bot' | 'system';
  content: string;
  model?: string;
  image?: string;
  audio?: string;
}

interface BrevoCopilotProps {
  context: string;
  isOpen: boolean;
  onClose: () => void;
}

const WELCOME_MESSAGES: Record<string, string> = {
  "Solutions Architect": "👋 Aura Solutions Architect initialized. I am synced with Brevo's latest documentation. I can help you design scalable event-driven architectures, navigate API rate limits, and orchestrate distributed workflows using webhooks and MCP. Try asking: 'How do I architect a high-volume cart abandonment flow?'",
  "Developer Tester": "💻 Aura Developer Tester initialized. Ready to build. I can generate cURL commands, debug webhook payloads, format JSON for the Transactional API, and validate your setup. Try asking: 'Generate a Postman script for the /v3/smtp/email endpoint.'",
  "Technical Support": "🛠️ Aura Technical Support initialized. I'm here to diagnose system issues. Experiencing 401/404 errors, deliverability drops, or webhook timeouts? I can explain error codes and provide mitigation steps. Try asking: 'Why am I getting a x-sib-ratelimit error?'",
  "Customer Service": "🤝 Aura Customer Service initialized. I can explain Brevo's marketing features, campaign setup, and billing in plain language. Try asking: 'How do I set up a dynamic product feed in my email template?'",
  "Sales Engineering": "⚙️ Aura SE initialized. I bridge architecture and business value. I can map Brevo APIs to client requirements, overcome technical objections, and design custom event schemas. Try: 'How do I handle objections about Brevo's webhook rate limits vs. enterprise middleware?'",
  "Sales Executive": "💼 Aura Sales Exec initialized. I focus on ROI, competitive differentiation, and closing strategy. Try: 'Give me a 3-point value prop comparing Brevo's decoupled architecture to Salesforce Marketing Cloud for mid-market retail.'"
};

const BrevoCopilot: React.FC<BrevoCopilotProps> = ({ context, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [role, setRole] = useState('Technical Support');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveVoice, setIsLiveVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setMessages([{ role: 'system', content: WELCOME_MESSAGES[role] }]);
    }
  }, [isOpen]);

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    setMessages(prev => [
      ...prev,
      { role: 'system', content: WELCOME_MESSAGES[newRole] }
    ]);
  };

  const backupChat = async () => {
    if (messages.length === 0) return;
    try {
      await fetch('/api/chat/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, role })
      });
      alert('Chat session backed up successfully.');
    } catch (e) {
      console.error('Failed to backup chat', e);
      alert('Failed to backup chat.');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, role, context }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }
      
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: data.reply,
        model: data.model,
        image: data.image,
        audio: data.audio
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'bot', content: '> [System Error] Failed to connect to Nova-Σ. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal id="modal-brevo-copilot" isOpen={isOpen} onClose={onClose} title={<><MessageSquare size={20} /> Module F: Aura Copilot</>} className="max-w-4xl h-[80vh]">
      <div className="flex flex-col h-full bg-white rounded-xl shadow border border-[var(--brand-charcoal-grey-75)] p-6">
        <div className="flex justify-between items-center mb-4">
          <select 
            id="copilot-role-select"
            value={role} 
            onChange={(e) => handleRoleChange(e.target.value)} 
            className="p-2 rounded-lg bg-[var(--brand-charcoal-grey-25)] border border-[var(--brand-charcoal-grey-75)] text-[var(--brand-charcoal-grey-900)] font-semibold"
          >
            <option>Solutions Architect</option>
            <option>Developer Tester</option>
            <option>Technical Support</option>
            <option>Customer Service</option>
            <option>Sales Engineering</option>
            <option>Sales Executive</option>
          </select>
          <button id="copilot-backup-btn" onClick={backupChat} className="flex items-center gap-2 px-3 py-2 bg-[var(--brand-charcoal-grey-200)] hover:bg-[var(--brand-charcoal-grey-300)] rounded-lg text-sm font-semibold transition-all">
            <Save size={16} /> Backup Session
          </button>
        </div>
        
        <div id="copilot-messages-container" className="flex-1 overflow-y-auto mb-4 border border-[var(--brand-charcoal-grey-75)] p-4 rounded-lg bg-[var(--brand-charcoal-grey-25)]">
          {messages.map((msg, i) => (
            <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : msg.role === 'system' ? 'text-center' : 'text-left'}`}>
              <div className={`inline-block p-3 rounded-lg text-sm max-w-[85%] ${
                msg.role === 'user' 
                  ? 'bg-[var(--brand-iris-purple-500)] text-white' 
                  : msg.role === 'system'
                    ? 'bg-[var(--brand-mint-green-100)] text-[var(--brand-forest-green-700)] border border-[var(--brand-mint-green-300)] w-full text-left'
                    : 'bg-[var(--brand-charcoal-grey-200)] text-[var(--brand-charcoal-grey-900)]'
              }`}>
                {msg.model && (
                  <div className="text-xs font-bold mb-2 opacity-75 flex items-center gap-1">
                    {msg.model.includes('Gemini') ? '⚡' : msg.model.includes('Nano Banana') ? '🎨' : '🎵'} Powered by {msg.model}
                  </div>
                )}
                <div className="markdown-body">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.image && (
                  <img src={msg.image} alt="Generated" className="mt-3 rounded-lg max-w-full h-auto" referrerPolicy="no-referrer" />
                )}
                {msg.audio && (
                  <audio controls src={msg.audio} className="mt-3 w-full" />
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-left mb-4">
              <div className="inline-block p-3 rounded-lg text-sm bg-[var(--brand-charcoal-grey-200)] text-[var(--brand-charcoal-grey-900)] flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-[var(--brand-forest-green-600)]" />
                <span className="italic text-[var(--brand-charcoal-grey-600)]">Nova-Σ is reasoning...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setIsLiveVoice(!isLiveVoice)}
            className={`p-3 rounded-lg transition-colors flex items-center justify-center ${isLiveVoice ? 'bg-red-500 text-white animate-pulse' : 'bg-[var(--brand-charcoal-grey-200)] text-[var(--brand-charcoal-grey-900)] hover:bg-[var(--brand-charcoal-grey-300)]'}`}
            title="Live Voice (Simulated)"
          >
            {isLiveVoice ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input 
            id="copilot-input"
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={isLoading || isLiveVoice}
            className="flex-1 p-3 rounded-lg bg-[var(--brand-charcoal-grey-25)] border border-[var(--brand-charcoal-grey-75)] text-[var(--brand-charcoal-grey-900)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-forest-green-600)] disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={isLiveVoice ? "Listening..." : "Ask Aura Copilot..."}
          />
          <button 
            id="copilot-send-btn"
            onClick={sendMessage} 
            disabled={isLoading || !input.trim() || isLiveVoice}
            className="px-6 py-3 bg-[var(--brand-forest-green-600)] text-white font-bold rounded-lg hover:bg-[var(--brand-forest-green-500)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BrevoCopilot;
