import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Microchip } from 'lucide-react';
import { Device, deviceLibrary, DevicePort, PinSide } from '../data/devices';
import { useSimulationContext } from '../context/SimulationContext';

interface ConnectionLine {
  from: { deviceId: string; portId: string };
  to: { deviceId: string; portId: string };
  path: string;
}

interface WorkbenchProps {
  className?: string;
  onDeviceSelect?: (device: Device | null) => void;
}

interface DeviceInstance {
  instanceId: string;
  deviceId: string;
  position: { x: number; y: number };
  connections?: ConnectionLine[];
}

const Workbench = ({ className, onDeviceSelect }: WorkbenchProps) => {
  const [devices, setDevices] = useState<DeviceInstance[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedPort, setSelectedPort] = useState<{deviceId: string, port: DevicePort} | null>(null);
  const [draggingDevice, setDraggingDevice] = useState<string | null>(null);
  const [connections, setConnections] = useState<ConnectionLine[]>([]);
  const [nextId, setNextId] = useState(1);
  const workbenchRef = useRef<HTMLDivElement>(null);
  const { addDevice } = useSimulationContext();

  // Handle drop of new device onto workbench
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const deviceId = e.dataTransfer.getData('device');
    
    if (deviceId) {
      const workbenchRect = workbenchRef.current?.getBoundingClientRect();
      if (!workbenchRect) return;
      
      const deviceInstance = {
        instanceId: `${deviceId}-${nextId}`,
        deviceId,
        position: { 
          x: e.clientX - workbenchRect.left - 50, 
          y: e.clientY - workbenchRect.top - 25 
        }
      };
      
      setDevices(prev => [...prev, deviceInstance]);
      setNextId(prev => prev + 1);
      
      // Add to simulation
      const deviceConfig = deviceLibrary.find(d => d.id === deviceId);
      if (deviceConfig) {
        addDevice(deviceConfig, deviceInstance.instanceId);
      }
    }
  };

  // Allow dropping on the workbench
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle device selection
  const handleDeviceClick = (instanceId: string) => {
    setSelectedDevice(selectedDevice === instanceId ? null : instanceId);
    
    if (selectedDevice === instanceId) {
      onDeviceSelect && onDeviceSelect(null);
    } else {
      const deviceInstance = devices.find(d => d.instanceId === instanceId);
      if (deviceInstance) {
        const deviceConfig = deviceLibrary.find(d => d.id === deviceInstance.deviceId);
        if (deviceConfig) {
          onDeviceSelect && onDeviceSelect(deviceConfig);
        }
      }
    }
  };

  // Handle pin click for connection
  const handlePinClick = (deviceId: string, port: DevicePort) => {
    // If no port is selected, select this one
    if (!selectedPort) {
      setSelectedPort({ deviceId, port });
      return;
    }
    
    // If clicking the same port, deselect it
    if (selectedPort.deviceId === deviceId && selectedPort.port.id === port.id) {
      setSelectedPort(null);
      return;
    }
    
    // Otherwise, create a connection between the selected port and this one
    const newConnection: ConnectionLine = {
      from: { deviceId: selectedPort.deviceId, portId: selectedPort.port.id },
      to: { deviceId, portId: port.id },
      path: "M0,0 L100,100" // Placeholder - will be calculated on render
    };
    
    setConnections(prev => [...prev, newConnection]);
    setSelectedPort(null);
  };

  // Start dragging a device around the workbench
  const handleDeviceDragStart = (e: React.DragEvent, instanceId: string) => {
    setDraggingDevice(instanceId);
  };

  // Handle device being dragged within the workbench
  const handleDeviceDrag = (e: React.DragEvent, instanceId: string) => {
    if (!draggingDevice || draggingDevice !== instanceId) return;
    
    const workbenchRect = workbenchRef.current?.getBoundingClientRect();
    if (!workbenchRect || !e.clientX || !e.clientY) return;
    
    setDevices(prev => prev.map(d => {
      if (d.instanceId === instanceId) {
        return {
          ...d,
          position: {
            x: Math.max(0, Math.min(e.clientX - workbenchRect.left - 50, workbenchRect.width - 100)),
            y: Math.max(0, Math.min(e.clientY - workbenchRect.top - 25, workbenchRect.height - 50))
          }
        };
      }
      return d;
    }));
  };

  // End dragging a device
  const handleDeviceDragEnd = () => {
    setDraggingDevice(null);
  };

  // Get pin position based on side and device position
  const getPinPosition = (
    devicePos: { x: number; y: number },
    deviceDimensions: { width: number; height: number } = { width: 100, height: 80 },
    side: PinSide = 'left',
    position: number = 0,
    totalPins: number = 1
  ) => {
    const PIN_SPACING = 15; // Space between pins
    const startOffset = 20; // Start pins this far from the edge
    
    switch (side) {
      case 'left':
        return {
          x: devicePos.x,
          y: devicePos.y + startOffset + (position * PIN_SPACING)
        };
      case 'right':
        return {
          x: devicePos.x + deviceDimensions.width,
          y: devicePos.y + startOffset + (position * PIN_SPACING)
        };
      case 'top':
        return {
          x: devicePos.x + startOffset + (position * PIN_SPACING),
          y: devicePos.y
        };
      case 'bottom':
        return {
          x: devicePos.x + startOffset + (position * PIN_SPACING),
          y: devicePos.y + deviceDimensions.height
        };
      default:
        return { x: devicePos.x, y: devicePos.y };
    }
  };

  // Get color for pin based on type
  const getPinColor = (portType: string) => {
    switch (portType) {
      case 'power':
        return 'bg-red-500';
      case 'ground':
        return 'bg-blue-500';
      case 'input':
        return 'bg-green-500';
      case 'output':
        return 'bg-yellow-500';
      case 'data':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Render device pins
  const renderPins = (device: DeviceInstance) => {
    const deviceConfig = deviceLibrary.find(d => d.id === device.deviceId);
    if (!deviceConfig) return null;
    
    const dimensions = deviceConfig.dimensions || { width: 100, height: 80 };
    
    return deviceConfig.ports.map(port => {
      const isSelected = selectedPort && 
                         selectedPort.deviceId === device.instanceId && 
                         selectedPort.port.id === port.id;
      
      const pinPosition = getPinPosition(
        device.position, 
        dimensions,
        port.side || 'left',
        port.position || 0,
        deviceConfig.ports.filter(p => p.side === port.side).length
      );
      
      return (
        <div 
          key={`${device.instanceId}-${port.id}`}
          className={`absolute w-3 h-3 rounded-full cursor-pointer border ${getPinColor(port.type)} 
            ${isSelected ? 'ring-2 ring-white scale-125' : ''} z-10`}
          style={{
            left: `${pinPosition.x}px`,
            top: `${pinPosition.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
          onClick={(e) => {
            e.stopPropagation();
            handlePinClick(device.instanceId, port);
          }}
          title={`${port.name} (${port.type}${port.dataType ? `, ${port.dataType}` : ''})`}
        />
      );
    });
  };

  // Render a device on the workbench
  const renderDevice = (device: DeviceInstance) => {
    const deviceConfig = deviceLibrary.find(d => d.id === device.deviceId);
    if (!deviceConfig) return null;
    
    const isSelected = selectedDevice === device.instanceId;
    const dimensions = deviceConfig.dimensions || { width: 100, height: 80 };
    
    return (
      <React.Fragment key={device.instanceId}>
        <div
          className={`absolute cursor-move bg-secondary border-2 rounded-md p-2 select-none
            ${isSelected ? 'border-primary ring-2 ring-primary/50' : 'border-secondary'}`}
          style={{
            left: `${device.position.x}px`,
            top: `${device.position.y}px`,
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleDeviceClick(device.instanceId);
          }}
          draggable
          onDragStart={(e) => handleDeviceDragStart(e, device.instanceId)}
          onDrag={(e) => handleDeviceDrag(e, device.instanceId)}
          onDragEnd={handleDeviceDragEnd}
        >
          <div className="text-xs font-medium truncate text-center">{deviceConfig.name}</div>
          <div className="text-[10px] text-muted-foreground text-center">{device.instanceId}</div>
        </div>
        
        {/* Render pins */}
        {renderPins(device)}
      </React.Fragment>
    );
  };

  return (
    <Card className={`border-border bg-black/20 shadow-lg backdrop-blur-sm ${className || ''}`}>
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <Microchip className="h-5 w-5" />
          <span>Workbench</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 relative">
        <div 
          ref={workbenchRef}
          className="workbench-grid relative h-[500px] w-full overflow-hidden"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => {
            setSelectedDevice(null);
            setSelectedPort(null);
            onDeviceSelect && onDeviceSelect(null);
          }}
        >
          {/* Render SVG connections layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map((conn, index) => {
              // Find source and target devices
              const sourceDevice = devices.find(d => d.instanceId === conn.from.deviceId);
              const targetDevice = devices.find(d => d.instanceId === conn.to.deviceId);
              
              if (!sourceDevice || !targetDevice) return null;
              
              // Find device configs
              const sourceConfig = deviceLibrary.find(d => d.id === sourceDevice.deviceId);
              const targetConfig = deviceLibrary.find(d => d.id === targetDevice.deviceId);
              
              if (!sourceConfig || !targetConfig) return null;
              
              // Find port configs
              const sourcePort = sourceConfig.ports.find(p => p.id === conn.from.portId);
              const targetPort = targetConfig.ports.find(p => p.id === conn.to.portId);
              
              if (!sourcePort || !targetPort) return null;
              
              // Calculate positions
              const sourceDimensions = sourceConfig.dimensions || { width: 100, height: 80 };
              const targetDimensions = targetConfig.dimensions || { width: 100, height: 80 };
              
              const sourcePos = getPinPosition(
                sourceDevice.position, 
                sourceDimensions, 
                sourcePort.side || 'left', 
                sourcePort.position || 0
              );
              
              const targetPos = getPinPosition(
                targetDevice.position, 
                targetDimensions, 
                targetPort.side || 'left',
                targetPort.position || 0
              );
              
              // Determine line color based on connection type
              let strokeColor = '#888888';
              if (sourcePort.type === 'power' || targetPort.type === 'power') {
                strokeColor = '#ff0000'; // Red for power
              } else if (sourcePort.type === 'ground' || targetPort.type === 'ground') {
                strokeColor = '#0000ff'; // Blue for ground
              } else if (sourcePort.dataType === 'digital' || targetPort.dataType === 'digital') {
                strokeColor = '#00ff00'; // Green for digital
              } else if (sourcePort.dataType === 'analog' || targetPort.dataType === 'analog') {
                strokeColor = '#ffff00'; // Yellow for analog
              }
              
              // Draw a bezier curve for smoother connection lines
              const dx = targetPos.x - sourcePos.x;
              const dy = targetPos.y - sourcePos.y;
              const controlPoint1 = {
                x: sourcePos.x + dx * 0.5,
                y: sourcePos.y
              };
              const controlPoint2 = {
                x: targetPos.x - dx * 0.5,
                y: targetPos.y
              };
              
              const path = `M ${sourcePos.x} ${sourcePos.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${targetPos.x} ${targetPos.y}`;
              
              return (
                <g key={`connection-${index}`}>
                  <path 
                    d={path} 
                    fill="none" 
                    stroke={strokeColor} 
                    strokeWidth="2" 
                  />
                </g>
              );
            })}
          </svg>
          
          {devices.map(renderDevice)}
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-2 border-t text-xs text-muted-foreground">
        {selectedPort ? (
          <div>
            Select another pin to connect with {selectedPort.port.name} 
            ({selectedPort.port.type}{selectedPort.port.dataType ? `, ${selectedPort.port.dataType}` : ''})
          </div>
        ) : (
          <div>
            Drag devices from the library. Click pins to create connections.
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default Workbench;
