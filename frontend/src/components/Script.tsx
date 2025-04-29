import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Sparkles } from "lucide-react";
import { motion } from 'framer-motion';

export interface ScriptLine {
  id: string;
  character: string;
  text: string;
  isUserCharacter: boolean;
}

interface ScriptProps {
  lines: ScriptLine[];
  currentLineIndex: number;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  characterName: string;
}

const Script: React.FC<ScriptProps> = ({
  lines,
  currentLineIndex,
  isRecording,
  onStartRecording,
  onStopRecording,
  characterName,
}) => {
  return (
    <div className="backdrop-blur-md bg-black/40 border border-purple-500/30 rounded-xl overflow-hidden shadow-xl h-full">
      <div className="bg-gradient-to-r from-purple-800/50 to-amber-700/50 p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-amber-400" />
          <span>Your Character: </span>
          <span className="ml-2 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600 font-bold">
            {characterName}
          </span>
        </h2>
        {lines[currentLineIndex]?.isUserCharacter && (
          <Button
            variant="outline"
            className={`${
              isRecording 
                ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30" 
                : "bg-amber-500/20 border-amber-500 text-amber-400 hover:bg-amber-500/30"
            } transition-all duration-300 shadow-lg`}
            onClick={isRecording ? onStopRecording : onStartRecording}
          >
            {isRecording ? (
              <>
                <MicOff className="mr-2 h-5 w-5 animate-pulse" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="mr-2 h-5 w-5" />
                Record Line
              </>
            )}
          </Button>
        )}
      </div>

      <div className="p-6">
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {lines.map((line, index) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0.8 }}
              animate={{ 
                opacity: 1,
                scale: index === currentLineIndex ? 1 : 0.98
              }}
              transition={{ duration: 0.3 }}
              className={`p-4 rounded-lg transition-all duration-300 ${
                index === currentLineIndex 
                  ? "bg-gradient-to-r from-amber-500/20 to-purple-500/20 border-l-4 border-amber-500 shadow-lg" 
                  : "bg-black/20 hover:bg-black/30"
              }`}
            >
              <div className="font-medium mb-2 flex items-center">
                {line.isUserCharacter ? (
                  <span className="font-semibold text-amber-400 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-amber-400" />
                    {characterName} (You)
                  </span>
                ) : (
                  <span className="text-purple-300 font-medium">{line.character}</span>
                )}
              </div>
              <div className="font-medium text-gray-100 leading-relaxed">{line.text}</div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.4);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.6);
        }
      `}</style>
    </div>
  );
};

export default Script;
