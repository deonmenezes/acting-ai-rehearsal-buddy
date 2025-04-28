
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Script {
  id: string;
  title: string;
  movie: string;
  year: number;
}

interface ScriptSelectionProps {
  scripts: Script[];
  selectedScript: string | null;
  onSelectScript: (scriptId: string) => void;
}

const ScriptSelection: React.FC<ScriptSelectionProps> = ({ 
  scripts, 
  selectedScript, 
  onSelectScript 
}) => {
  return (
    <Card className="theater-card">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold text-theater-gold mb-2">Choose a Scene</h2>
        <Select
          value={selectedScript || ""}
          onValueChange={onSelectScript}
        >
          <SelectTrigger className="w-full bg-black/50 border-theater-gold/30 text-white">
            <SelectValue placeholder="Select a scene to rehearse" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-theater-gold/30 text-white">
            {scripts.map((script) => (
              <SelectItem key={script.id} value={script.id} className="hover:bg-theater-gold/20">
                {script.title} - {script.movie} ({script.year})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default ScriptSelection;
