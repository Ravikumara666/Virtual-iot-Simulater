
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Play, Square, Terminal } from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

interface CodeEditorProps {
  initialCode?: string;
  onRun?: (code: string) => void;
}

const CodeEditor = ({ initialCode = '', onRun }: CodeEditorProps) => {
  const [code, setCode] = useState(initialCode);
  const [activeTab, setActiveTab] = useState<string>('editor');
  const { compileCode, startSimulation, stopSimulation, isRunning, consoleOutput } = useSimulation();
  
  const handleRun = () => {
    const result = compileCode('main-device', code);
    
    if (result.success) {
      toast({
        title: 'Compilation successful',
        description: 'Running simulation...',
        duration: 2000,
      });
      
      // Switch to console view
      setActiveTab('console');
      
      // Start simulation
      startSimulation(code);
      
      if (onRun) {
        onRun(code);
      }
    } else {
      toast({
        title: 'Compilation failed',
        description: result.errors.join('\n'),
        variant: 'destructive',
      });
    }
  };
  
  const handleStop = () => {
    stopSimulation();
    toast({
      title: 'Simulation stopped',
      duration: 2000,
    });
  };
  
  return (
    <Card className="border-border bg-black/20 shadow-lg backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <Code className="h-5 w-5" />
          <span>Code Editor</span>
        </CardTitle>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={isRunning ? "destructive" : "secondary"} 
            size="sm" 
            onClick={isRunning ? handleStop : handleRun}
            className="px-3"
          >
            {isRunning ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="editor" className="text-xs">Editor</TabsTrigger>
              <TabsTrigger value="console" className="text-xs">Console</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="editor" className="mt-0">
            <div className="code-editor p-0 h-[400px] w-full">
              <textarea
                className="w-full h-full bg-transparent text-foreground font-mono text-sm p-4 focus:outline-none resize-none"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Write your code here..."
                spellCheck={false}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="console" className="mt-0">
            <ScrollArea className="terminal h-[400px]">
              <div className="p-4">
                {consoleOutput.length === 0 ? (
                  <div className="text-gray-400 italic">Console output will appear here when you run the code.</div>
                ) : (
                  consoleOutput.map((entry, index) => (
                    <div 
                      key={index} 
                      className={`terminal-line ${
                        entry.type === 'error' ? 'terminal-error' : 
                        entry.type === 'warn' ? 'text-yellow-400' : 
                        'terminal-success'
                      }`}
                    >
                      {entry.message}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="px-4 py-2 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5" />
          <span>Use functions like digitalWrite(), digitalRead(), etc. to interact with devices</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CodeEditor;
