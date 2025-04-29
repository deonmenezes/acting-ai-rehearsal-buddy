import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Film, Mic, ArrowRight, Clapperboard } from 'lucide-react';
import { ScriptData, scriptData } from '@/data/scriptData';

interface ScriptSelectionProps {
  className?: string;
}

const ScriptSelection: React.FC<ScriptSelectionProps> = ({ className }) => {
  return (
    <div className={`${className || ''}`}>
      <h2 className="text-2xl font-bold text-theater-gold mb-6 text-center">
        <Clapperboard className="inline-block mr-2 mb-1 h-6 w-6" />
        Practice Famous Dialogues
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {scriptData.map((script) => (
          <Card 
            key={script.id} 
            className="overflow-hidden bg-black/40 border-amber-500/30 hover:border-amber-500/60 transition-all duration-300 backdrop-blur-md"
          >
            <CardHeader className="bg-gradient-to-r from-amber-900/50 to-amber-700/30 p-4">
              <CardTitle className="text-lg font-bold text-white">
                {script.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-300">
                  <Film className="h-4 w-4 mr-2 text-amber-400" />
                  <span className="text-amber-400">{script.movie}</span> ({script.year})
                </div>
                
                <div className="flex items-center text-sm text-gray-300">
                  <Mic className="h-4 w-4 mr-2 text-purple-400" />
                  Character: <span className="text-purple-400 ml-1">{script.character}</span>
                </div>
                
                <div className="mt-4 p-3 border border-amber-500/20 rounded-lg bg-black/30">
                  <p className="text-sm text-gray-300 italic line-clamp-3">
                    "{script.lines.find(line => line.isUserCharacter)?.text}"
                  </p>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="bg-black/20 p-4 border-t border-amber-500/20">
              <Link to={`/dialogue-rehearsal/${script.id}`} className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                >
                  Practice This Dialogue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScriptSelection;
