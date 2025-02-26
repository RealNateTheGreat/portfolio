import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const handleScroll = () => {
      const scrollTop = content.scrollTop;
      const scrollHeight = content.scrollHeight;
      const clientHeight = content.clientHeight;

      // Add top blur when scrolled down
      content.style.maskImage = scrollTop > 0 
        ? 'linear-gradient(to bottom, transparent, black 50px, black calc(100% - 50px), transparent)'
        : 'none';
      content.style.webkitMaskImage = content.style.maskImage;

      // Show bottom blur only when there's more  content to scroll
      if (scrollHeight > clientHeight) {
        const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
        content.style.maskImage = isAtBottom
          ? 'linear-gradient(to bottom, transparent, black 50px)'
          : 'linear-gradient(to bottom, transparent, black 50px, black calc(100% - 50px), transparent)';
        content.style.webkitMaskImage = content.style.maskImage;
      }
    };

    content.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => content.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className="relative w-full max-w-2xl bg-gray-900 border-2 border-white/20 rounded-2xl shadow-xl"
        >
          {/* Header with sticky close buttond */}
          <div className="sticky top-0 z-10 flex justify-end p-4 bg-gray-900 rounded-t-2xl border-b border-white/10">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Content */}
          <div 
            ref={contentRef}
            className="p-6 overflow-y-auto max-h-[calc(100vh-8rem)] scroll-smooth"
          >
            {title && (
              <h2 className="text-2xl font-bold text-white mb-4 sm:text-xl">{title}</h2>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}