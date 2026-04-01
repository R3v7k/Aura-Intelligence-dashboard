import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className = "", id }) => {
  if (!isOpen) return null;

  return (
    <div id={id} className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className={`bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden w-full max-w-4xl max-h-[90vh] ${className}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 bg-[var(--brand-mint-green-100)]">
          {children}
        </div>
      </div>
    </div>
  );
};
