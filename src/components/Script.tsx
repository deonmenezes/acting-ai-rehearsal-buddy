
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

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
    <Card className="theater-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-theater-gold">
            Your Character: <span className="text-white">{characterName}</span>
          </h2>
          {lines[currentLineIndex]?.isUserCharacter && (
            <Button
              variant="outline"
              className={`${
                isRecording 
                  ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30" 
                  : "bg-theater-gold/20 border-theater-gold text-theater-gold hover:bg-theater-gold/30"
              }`}
              onClick={isRecording ? onStopRecording : onStartRecording}
            >
              {isRecording ? (
                <>
                  <MicOff className="mr-2 h-4 w-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Record Line
                </>
              )}
            </Button>
          )}
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {lines.map((line, index) => (
            <div
              key={line.id}
              className={`script-line ${index === currentLineIndex ? "active" : ""}`}
            >
              <div className="font-medium mb-1">
                {line.isUserCharacter ? (
                  <span className="actor-line">{characterName} (You)</span>
                ) : (
                  <span className="other-character-line">{line.character}</span>
                )}
              </div>
              <div className="text-white">{line.text}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Script;
