import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-4 gap-8 opacity-5">
            {[...Array(16)].map((_, i) => (
              <AlertCircle 
                key={i} 
                className="w-24 h-24 text-white animate-[wave_2s_ease-in-out_infinite] [animation-delay:var(--delay)]" 
                style={{ '--delay': `${i * 0.2}s` } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#5865F2]/10 via-[#5865F2]/5 to-gray-900"></div>
      </div>

      <div className="relative text-center space-y-8 max-w-2xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-8xl sm:text-7xl md:text-8xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent animate-float">
            404
          </h1>
          <p className="text-2xl sm:text-xl md:text-2xl text-gray-300">
            Oops! Looks like you've ventured into unknown territory
          </p>
          <p className="text-gray-400 text-lg sm:text-base md:text-lg">
            The page you're looking for seems to have disappeared into the digital void
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-indigo-600/20 border-2 border-indigo-600 rounded-xl text-white hover:bg-indigo-600/30 transition-all group w-full sm:w-auto"
          >
            <Home className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:animate-bounce" />
            <span className="font-medium text-base sm:text-sm md:text-base">Return Home</span>
          </button>
          
          <a 
            href="https://discord.com/users/your-discord-id"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-6 py-3 bg-[#5865F2]/20 border-2 border-[#5865F2] rounded-xl text-white hover:bg-[#5865F2]/30 transition-all group w-full sm:w-auto"
          >
            <MessageSquare className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:animate-bounce" />
            <span className="font-medium text-base sm:text-sm md:text-base">Contact Support</span>
          </a>
        </div>

        <div className="pt-8">
          <div className="animate-float">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-75"></div>
              <img
                src="https://i.imgur.com/HVZOV5f.png"
                alt="404 Illustration"
                className="relative w-24 h-24 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto rounded-full border-2 border-white/20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}