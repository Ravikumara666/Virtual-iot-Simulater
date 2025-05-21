
import { useState, useEffect, useRef } from 'react';
import { Device } from '../data/devices';

interface SimulationDevice {
  instanceId: string;
  device: Device;
  state: Record<string, any>;
}

interface SimulationOptions {
  timeout?: number;
  maxIterations?: number;
}

interface CompilationResult {
  success: boolean;
  output: string[];
  errors: string[];
}

const DEFAULT_OPTIONS: SimulationOptions = {
  timeout: 10000, // 10 seconds max runtime by default
  maxIterations: 1000
};

export const useSimulation = () => {
  const [devices, setDevices] = useState<SimulationDevice[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [consoleOutput, setConsoleOutput] = useState<Array<{type: string, message: string}>>([]);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add device to simulation
  const addDevice = (device: Device, instanceId: string) => {
    setDevices(prev => [
      ...prev,
      {
        instanceId,
        device,
        state: { ...device.properties }
      }
    ]);
  };
  
  // Remove device from simulation
  const removeDevice = (instanceId: string) => {
    setDevices(prev => prev.filter(d => d.instanceId !== instanceId));
  };
  
  // Update device state
  const updateDeviceState = (instanceId: string, newState: Record<string, any>) => {
    setDevices(prev => prev.map(d => {
      if (d.instanceId === instanceId) {
        return {
          ...d,
          state: { ...d.state, ...newState }
        };
      }
      return d;
    }));
  };
  
  // Connect devices
  const connectDevices = (sourceId: string, sourcePort: string, targetId: string, targetPort: string) => {
    // Implementation would handle the logic of connecting devices
    console.log(`Connected ${sourceId}.${sourcePort} to ${targetId}.${targetPort}`);
    
    // In a real implementation, we would update the state to reflect the connection
  };
  
  // Compile code for device
  const compileCode = (instanceId: string, code: string): CompilationResult => {
    // Clear previous outputs
    const compilationOutput: string[] = [];
    const compilationErrors: string[] = [];
    
    try {
      // Simple syntax validation
      // This is a very basic check - a real compiler would do much more
      new Function(code); // Will throw if syntax error
      
      compilationOutput.push("Compilation successful");
      
      return {
        success: true,
        output: compilationOutput,
        errors: compilationErrors
      };
    } catch (error: any) {
      compilationErrors.push(`Error: ${error.message}`);
      
      return {
        success: false,
        output: compilationOutput,
        errors: compilationErrors
      };
    }
  };
  
  // Run simulation
  const startSimulation = (code: string, options: SimulationOptions = DEFAULT_OPTIONS) => {
    if (isRunning) return;
    
    setIsRunning(true);
    setOutput([]);
    setErrors([]);
    setConsoleOutput([]);
    
    // Create a virtual console for the simulation
    const virtualConsole = {
      log: (message: string) => {
        setConsoleOutput(prev => [...prev, { type: 'log', message }]);
      },
      error: (message: string) => {
        setConsoleOutput(prev => [...prev, { type: 'error', message }]);
      },
      warn: (message: string) => {
        setConsoleOutput(prev => [...prev, { type: 'warn', message }]);
      }
    };
    
    // Create a virtual environment with device APIs
    const createSimulationEnvironment = () => {
      // This would be a much more complex implementation in a real simulator
      
      return {
        // Device interaction APIs
        digitalWrite: (pin: number, value: 'HIGH' | 'LOW') => {
          virtualConsole.log(`Set pin ${pin} to ${value}`);
          
          // Find devices connected to this pin and update them
          // This is just a simple example - real implementation would be much more complex
          if (pin === 13) { // LED pin in our example
            const led = devices.find(d => d.device.id === 'led');
            if (led) {
              updateDeviceState(led.instanceId, {
                state: value === 'HIGH' ? 'on' : 'off',
                brightness: value === 'HIGH' ? 100 : 0
              });
            }
          }
          
          return true;
        },
        
        digitalRead: (pin: number) => {
          virtualConsole.log(`Read from pin ${pin}`);
          
          // Handle motion sensor as an example
          if (pin === 7) { // Motion sensor pin in our example
            const motionSensor = devices.find(d => d.device.id === 'motion-sensor');
            if (motionSensor) {
              // Randomly detect motion sometimes
              const detected = Math.random() > 0.7;
              updateDeviceState(motionSensor.instanceId, { motionDetected: detected });
              return detected ? 'HIGH' : 'LOW';
            }
          }
          
          return 'LOW';
        },
        
        analogRead: (pin: string) => {
          virtualConsole.log(`Analog read from ${pin}`);
          
          // Example: read from temperature sensor on A0
          if (pin === 'A0') {
            const tempSensor = devices.find(d => d.device.id === 'temp-sensor');
            if (tempSensor) {
              const temp = tempSensor.state.currentValue;
              // Convert to analog reading (0-1023)
              return Math.floor((temp + 40) * 10); // Map -40 to 125°C to 0-1023
            }
          }
          
          return Math.floor(Math.random() * 1024); // Random value for other pins
        },
        
        delay: (ms: number) => {
          virtualConsole.log(`Delay ${ms}ms`);
          // Note: In a real simulator, this would pause execution
          // For our simple version, we'll just log it
        },
        
        pinMode: (pin: number, mode: 'INPUT' | 'OUTPUT') => {
          virtualConsole.log(`Set pin ${pin} mode to ${mode}`);
        },
        
        // Utility functions and APIs
        console: virtualConsole,
        
        // Include additional virtual device APIs as needed
        sensor: {
          read: (type: string) => {
            if (type === 'temperature') {
              const tempSensor = devices.find(d => d.device.id === 'temp-sensor');
              if (tempSensor) {
                // Simulate slight temperature variations
                const baseTemp = tempSensor.state.currentValue;
                const newTemp = baseTemp + (Math.random() - 0.5);
                updateDeviceState(tempSensor.instanceId, { currentValue: newTemp });
                return newTemp.toFixed(1);
              }
            }
            return 0;
          }
        },
        
        // Include simulated libraries
        WiFi: {
          begin: (ssid: string, password: string) => {
            virtualConsole.log(`Connecting to WiFi: ${ssid}`);
            const wifiModule = devices.find(d => d.device.id === 'wifi-module');
            if (wifiModule) {
              updateDeviceState(wifiModule.instanceId, { 
                ssid, 
                connected: true,
                signal: Math.floor(70 + Math.random() * 30)
              });
            }
          },
          status: () => {
            const wifiModule = devices.find(d => d.device.id === 'wifi-module');
            return wifiModule?.state.connected ? 'WL_CONNECTED' : 'WL_DISCONNECTED';
          },
          localIP: () => {
            const wifiModule = devices.find(d => d.device.id === 'wifi-module');
            return wifiModule?.state.ip || '0.0.0.0';
          },
          RSSI: () => {
            const wifiModule = devices.find(d => d.device.id === 'wifi-module');
            return wifiModule?.state.signal || 0;
          },
          reconnect: () => {
            virtualConsole.log("Reconnecting to WiFi...");
            const wifiModule = devices.find(d => d.device.id === 'wifi-module');
            if (wifiModule) {
              updateDeviceState(wifiModule.instanceId, { connected: true });
            }
          }
        },
        
        // Constants
        HIGH: 'HIGH',
        LOW: 'LOW',
        INPUT: 'INPUT',
        OUTPUT: 'OUTPUT',
        WL_CONNECTED: 'WL_CONNECTED',
        WL_DISCONNECTED: 'WL_DISCONNECTED'
      };
    };
    
    try {
      // Create simulation environment
      const env = createSimulationEnvironment();
      
      // Prepare code for execution
      const wrappedCode = `
        (function(digitalWrite, digitalRead, analogRead, delay, pinMode, console, sensor, WiFi, HIGH, LOW, INPUT, OUTPUT, WL_CONNECTED, WL_DISCONNECTED) {
          // Helper functions for setup/loop pattern
          let setupFn = function() {};
          let loopFn = function() {};
          
          function setup(fn) { setupFn = fn; }
          function loop(fn) { loopFn = fn; }
          
          // Execute user code
          ${code}
          
          // Run setup once
          if (typeof setup === 'function') {
            setup();
          } else if (typeof setupFn === 'function') {
            setupFn();
          }
          
          // Run loop function multiple times to simulate device behavior
          let loopFunction = typeof loop === 'function' ? loop : loopFn;
          for (let i = 0; i < 10; i++) {
            loopFunction();
          }
        })
      `;
      
      // Execute the wrapped code with our environment
      const simulationFunction = new Function('return ' + wrappedCode)();
      
      simulationFunction(
        env.digitalWrite, 
        env.digitalRead,
        env.analogRead,
        env.delay,
        env.pinMode,
        env.console,
        env.sensor,
        env.WiFi,
        env.HIGH,
        env.LOW,
        env.INPUT,
        env.OUTPUT,
        env.WL_CONNECTED,
        env.WL_DISCONNECTED
      );
      
      setOutput(prev => [...prev, 'Simulation completed successfully']);
    } catch (error: any) {
      setErrors(prev => [...prev, `Runtime Error: ${error.message}`]);
      virtualConsole.error(`Runtime Error: ${error.message}`);
    } finally {
      // Clean up simulation after timeout
      simulationRef.current = setTimeout(() => {
        setIsRunning(false);
      }, 1000); // Short delay to show "running" state
    }
  };
  
  // Stop simulation
  const stopSimulation = () => {
    if (simulationRef.current) {
      clearTimeout(simulationRef.current);
    }
    setIsRunning(false);
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        clearTimeout(simulationRef.current);
      }
    };
  }, []);
  
  return {
    devices,
    addDevice,
    removeDevice,
    updateDeviceState,
    connectDevices,
    compileCode,
    startSimulation,
    stopSimulation,
    output,
    errors,
    consoleOutput,
    isRunning
  };
};
