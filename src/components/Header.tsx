
import React from 'react';
import { Clapperboard } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-black/40 border-b border-theater-gold/30">
      <div className="flex items-center gap-2">
        <Clapperboard className="h-6 w-6 text-theater-gold" />
        <h1 className="text-xl font-bold text-theater-gold">AI Actor Rehearsal Buddy</h1>
      </div>
      <div className="text-sm text-gray-400">
        Powered by AI
      </div>
    </div>
  );
};

export default Header;
