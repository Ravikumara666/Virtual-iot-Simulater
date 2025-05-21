
import React, { useState } from 'react';
import Header from '@/components/Header';
import DeviceLibrary from '@/components/DeviceLibrary';
import Workbench from '@/components/Workbench';
import CodeEditor from '@/components/CodeEditor';
import SimulationPanel from '@/components/SimulationPanel';
import { Device } from '../data/devices';
import { SimulationProvider } from '@/context/SimulationContext';

const Index = () => {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  return (
    <SimulationProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-black">
        <Header />
        
        <main className="flex-1 container mx-auto py-6 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <DeviceLibrary 
                onSelectDevice={(device) => setSelectedDevice(device)} 
              />
              <SimulationPanel className="lg:block hidden" />
            </div>
            
            {/* Main Workbench Area */}
            <div className="lg:col-span-2">
              <Workbench 
                onDeviceSelect={setSelectedDevice}
              />
            </div>
            
            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <CodeEditor 
                initialCode={selectedDevice?.defaultCode || '// Select a device to see example code'}
              />
              <SimulationPanel className="lg:hidden block" />
            </div>
          </div>
        </main>
      </div>
    </SimulationProvider>
  );
};

export default Index;
