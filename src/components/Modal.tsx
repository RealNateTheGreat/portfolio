import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  hideCloseButton?: boolean;
}

export function Modal({ isOpen, onClose, title, children, hideCloseButton = false }: ModalProps) {
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
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

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

      // Show bottom blur only when there's more content to scroll
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-anime-darker border-2 border-pink-500/30 rounded-2xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glowing border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-lg opacity-50"></div>
              
              {/* Header with sticky close button - only shown if hideCloseButton is false */}
              {!hideCloseButton && (
                <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-anime-darker rounded-t-2xl border-b border-pink-500/20">
                  {title && (
                    <h2 className="text-xl font-bold text-white font-anime">{title}</h2>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(236, 72, 153, 0.2)" }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 hover:bg-pink-500/10 rounded-lg transition-colors ml-auto"
                  >
                    <X className="w-6 h-6 text-pink-300 sm:w-5 sm:h-5" />
                  </motion.button>
                </div>
              )}

              {/* Content */}
              <div 
                ref={contentRef}
                className="p-6 overflow-y-auto max-h-[calc(100vh-8rem)] scroll-smooth relative z-10"
              >
                {title && hideCloseButton && (
                  <h2 className="text-2xl font-bold text-white mb-4 sm:text-xl font-anime">{title}</h2>
                )}
                
                {/* Decorative elements */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}