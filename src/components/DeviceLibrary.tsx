
import React from 'react';
import { deviceLibrary, DeviceType, Device } from '../data/devices';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Computer, Database, Server, Cloud, Wifi, Plug, Terminal } from 'lucide-react';

interface DeviceLibraryProps {
  onSelectDevice: (device: Device) => void;
}

const DeviceIcon = ({ type }: { type: DeviceType }) => {
  switch (type) {
    case 'sensor':
      return <Database className="h-5 w-5" />;
    case 'actuator':
      return <Plug className="h-5 w-5" />;
    case 'controller':
      return <Computer className="h-5 w-5" />;
    case 'display':
      return <Terminal className="h-5 w-5" />;
    case 'communication':
      return <Wifi className="h-5 w-5" />;
    default:
      return <Server className="h-5 w-5" />;
  }
};

const DeviceLibrary = ({ onSelectDevice }: DeviceLibraryProps) => {
  const deviceTypes = Array.from(new Set(deviceLibrary.map(device => device.type)));

  return (
    <Card className="border-border bg-black/20 shadow-lg backdrop-blur-sm">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <Server className="h-5 w-5" />
          <span>Device Library</span>
        </CardTitle>
        <CardDescription>
          Drag and drop devices onto the workbench
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all" className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="w-full grid grid-cols-6">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              {deviceTypes.map(type => (
                <TabsTrigger key={type} value={type} className="text-xs">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-1">
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-1 gap-1 p-2">
                {deviceLibrary.map((device) => (
                  <DeviceCard key={device.id} device={device} onSelect={onSelectDevice} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          {deviceTypes.map(type => (
            <TabsContent key={type} value={type} className="mt-1">
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-1 gap-1 p-2">
                  {deviceLibrary
                    .filter(device => device.type === type)
                    .map((device) => (
                      <DeviceCard key={device.id} device={device} onSelect={onSelectDevice} />
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

const DeviceCard = ({ device, onSelect }: { device: Device, onSelect: (device: Device) => void }) => {
  return (
    <div 
      className="device-card flex items-center gap-3 p-3 hover:bg-white/5 rounded-md border border-border/50 cursor-pointer transition-all"
      onClick={() => onSelect(device)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('device', device.id);
      }}
    >
      <div className="p-2 rounded-md bg-primary/20 text-primary">
        <DeviceIcon type={device.type} />
      </div>
      <div className="flex-1 overflow-hidden">
        <h3 className="text-sm font-medium">{device.name}</h3>
        <p className="text-xs text-gray-400 truncate">{device.description}</p>
      </div>
      <Badge variant="secondary" className="text-xs capitalize">{device.type}</Badge>
    </div>
  );
};

export default DeviceLibrary;
