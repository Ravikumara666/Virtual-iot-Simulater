
import React from 'react';
import { Button } from "@/components/ui/button";
import { Cloud, Code, Server } from 'lucide-react';

const Header = () => {
  return (
    <header className="border-b border-border bg-black/40 backdrop-blur-md">
      <div className="container flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-md p-1.5">
            <Server className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Virtual IoT Workbench</h1>
            <p className="text-xs text-muted-foreground">Build IoT projects without hardware</p>
          </div>
        </div>
        
        <div className="hidden md:flex gap-4 items-center">
          <Button variant="outline" size="sm" className="gap-2">
            <Cloud className="h-4 w-4" />
            New Project
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Code className="h-4 w-4" />
            Examples
          </Button>
          <Button size="sm" className="gap-2">
            <Server className="h-4 w-4" />
            Deploy
          </Button>
        </div>
        
        <div className="md:hidden">
          <Button variant="outline" size="icon">
            <Server className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
