
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Server } from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';

interface SimulationPanelProps {
  className?: string;
}

const DeviceStateItem = ({ label, value }: { label: string; value: any }) => {
  // Format value based on its type
  const formattedValue = (() => {
    if (typeof value === 'boolean') {
      return value ? 'True' : 'False';
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  })();

  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-mono">{formattedValue}</span>
    </div>
  );
};

const SimulationPanel = ({ className }: SimulationPanelProps) => {
  const { devices, isRunning } = useSimulation();

  return (
    <Card className={`border-border bg-black/20 shadow-lg backdrop-blur-sm ${className || ''}`}>
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <Server className="h-5 w-5" />
          <span>Device Monitor</span>
          {isRunning && (
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse-glow"></span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        {devices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No devices active in simulation.</p>
            <p className="text-sm mt-2">Add devices from the library to see their status here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.instanceId} className="border-border border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 bg-primary rounded-full"></div>
                  <h3 className="font-medium text-sm">{device.device.name}</h3>
                  <span className="text-xs text-muted-foreground ml-auto">#{device.instanceId}</span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="space-y-1">
                  {Object.entries(device.state).map(([key, value]) => (
                    <DeviceStateItem key={key} label={key} value={value} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimulationPanel;
