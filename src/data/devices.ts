
export type DeviceType = 
  | 'sensor' 
  | 'actuator' 
  | 'controller' 
  | 'display' 
  | 'communication';

export type PinSide = 'left' | 'right' | 'top' | 'bottom';

export interface DevicePort {
  id: string;
  name: string;
  type: 'input' | 'output' | 'power' | 'ground' | 'data';
  dataType?: 'digital' | 'analog' | 'i2c' | 'spi' | 'uart';
  side?: PinSide;
  position?: number; // Position index along the side (0 = top/left, higher numbers = down/right)
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  description: string;
  image: string; // path to icon/image
  ports: DevicePort[];
  properties: Record<string, any>;
  defaultCode?: string;
  dimensions?: { width: number; height: number }; // Visual dimensions for rendering
}

// Helper function to create pins for microcontrollers
const createMicrocontrollerPins = (prefix: string, count: number, side: PinSide, offset: number = 0): DevicePort[] => {
  const pins: DevicePort[] = [];
  
  for (let i = 0; i < count; i++) {
    pins.push({
      id: `${prefix}${i + offset}`,
      name: `${prefix.toUpperCase()}${i + offset}`,
      type: i % 2 === 0 ? 'input' : 'output', // Alternating input/output for demonstration
      dataType: i < count / 2 ? 'digital' : 'analog',
      side,
      position: i
    });
  }
  
  return pins;
};

export const deviceLibrary: Device[] = [
  {
    id: 'temp-sensor',
    name: 'Temperature Sensor',
    type: 'sensor',
    description: 'Measures ambient temperature',
    image: 'temp-sensor',
    ports: [
      { id: 'vcc', name: 'VCC', type: 'power', side: 'left', position: 0 },
      { id: 'gnd', name: 'GND', type: 'ground', side: 'left', position: 1 },
      { id: 'data', name: 'DATA', type: 'output', dataType: 'analog', side: 'right', position: 0 }
    ],
    properties: {
      range: [-40, 125], // in Celsius
      precision: 0.5,
      currentValue: 22
    },
    dimensions: { width: 80, height: 60 },
    defaultCode: `// Temperature Sensor Example Code
function readTemperature() {
  // In a real device, this would read from hardware
  // For simulation, we'll use our virtual sensor
  return sensor.read('temperature');
}

// Main program loop
while (true) {
  let temp = readTemperature();
  console.log("Temperature: " + temp + "°C");
  delay(1000); // Wait 1 second
}`
  },
  {
    id: 'motion-sensor',
    name: 'Motion Sensor',
    type: 'sensor',
    description: 'Detects movement in an area',
    image: 'motion-sensor',
    ports: [
      { id: 'vcc', name: 'VCC', type: 'power', side: 'left', position: 0 },
      { id: 'gnd', name: 'GND', type: 'ground', side: 'left', position: 1 },
      { id: 'data', name: 'DATA', type: 'output', dataType: 'digital', side: 'right', position: 0 }
    ],
    properties: {
      range: [0, 5], // in meters
      motionDetected: false
    },
    dimensions: { width: 80, height: 60 },
    defaultCode: `// Motion Sensor Example Code
const int motionPin = 7;
let motionDetected = false;

// Setup
function setup() {
  pinMode(motionPin, INPUT);
  console.log("Motion sensor initialized!");
}

// Main program loop
function loop() {
  motionDetected = digitalRead(motionPin);
  
  if (motionDetected) {
    console.log("Motion detected!");
  } else {
    console.log("No motion");
  }
  
  delay(500); // Check every 500ms
}`
  },
  {
    id: 'led',
    name: 'LED',
    type: 'actuator',
    description: 'Light Emitting Diode',
    image: 'led',
    ports: [
      { id: 'anode', name: 'ANODE', type: 'input', side: 'left', position: 0 },
      { id: 'cathode', name: 'CATHODE', type: 'ground', side: 'right', position: 0 }
    ],
    properties: {
      color: '#ff0000', // red by default
      brightness: 0, // 0-100%
      state: 'off' // 'on' or 'off'
    },
    dimensions: { width: 40, height: 40 },
    defaultCode: `// LED Blinking Example
const int ledPin = 13;

// Setup 
function setup() {
  pinMode(ledPin, OUTPUT);
}

// Main program loop
function loop() {
  // Turn LED on
  digitalWrite(ledPin, HIGH);
  console.log("LED ON");
  delay(1000);
  
  // Turn LED off
  digitalWrite(ledPin, LOW);
  console.log("LED OFF");
  delay(1000);
}`
  },
  // ESP32 Microcontroller
  {
    id: 'esp32',
    name: 'ESP32',
    type: 'controller',
    description: 'Powerful microcontroller with WiFi & Bluetooth',
    image: 'microcontroller',
    ports: [
      // Power pins
      { id: '3v3', name: '3V3', type: 'power', side: 'left', position: 0 },
      { id: 'en', name: 'EN', type: 'input', side: 'left', position: 1 },
      { id: 'vp', name: 'VP', type: 'input', dataType: 'analog', side: 'left', position: 2 },
      { id: 'vn', name: 'VN', type: 'input', dataType: 'analog', side: 'left', position: 3 },
      { id: 'd34', name: 'D34', type: 'input', dataType: 'analog', side: 'left', position: 4 },
      { id: 'd35', name: 'D35', type: 'input', dataType: 'analog', side: 'left', position: 5 },
      { id: 'd32', name: 'D32', type: 'input', dataType: 'analog', side: 'left', position: 6 },
      { id: 'd33', name: 'D33', type: 'input', dataType: 'analog', side: 'left', position: 7 },
      { id: 'd25', name: 'D25', type: 'input', dataType: 'analog', side: 'left', position: 8 },
      { id: 'd26', name: 'D26', type: 'input', dataType: 'analog', side: 'left', position: 9 },
      { id: 'd27', name: 'D27', type: 'input', dataType: 'analog', side: 'left', position: 10 },
      { id: 'd14', name: 'D14', type: 'input', dataType: 'digital', side: 'left', position: 11 },
      { id: 'd12', name: 'D12', type: 'input', dataType: 'digital', side: 'left', position: 12 },
      { id: 'gnd1', name: 'GND', type: 'ground', side: 'left', position: 13 },
      { id: 'd13', name: 'D13', type: 'input', dataType: 'digital', side: 'left', position: 14 },
      
      // Right side pins
      { id: 'vcc', name: 'VIN', type: 'power', side: 'right', position: 0 },
      { id: 'gnd2', name: 'GND', type: 'ground', side: 'right', position: 1 },
      { id: 'd15', name: 'D15', type: 'output', dataType: 'digital', side: 'right', position: 2 },
      { id: 'd2', name: 'D2', type: 'output', dataType: 'digital', side: 'right', position: 3 },
      { id: 'd4', name: 'D4', type: 'output', dataType: 'digital', side: 'right', position: 4 },
      { id: 'rx2', name: 'RX2', type: 'input', dataType: 'uart', side: 'right', position: 5 },
      { id: 'tx2', name: 'TX2', type: 'output', dataType: 'uart', side: 'right', position: 6 },
      { id: 'd5', name: 'D5', type: 'output', dataType: 'digital', side: 'right', position: 7 },
      { id: 'd18', name: 'D18', type: 'output', dataType: 'digital', side: 'right', position: 8 },
      { id: 'd19', name: 'D19', type: 'output', dataType: 'digital', side: 'right', position: 9 },
      { id: 'd21', name: 'D21', type: 'output', dataType: 'digital', side: 'right', position: 10 },
      { id: 'd22', name: 'D22', type: 'output', dataType: 'digital', side: 'right', position: 11 },
      { id: 'd23', name: 'D23', type: 'output', dataType: 'digital', side: 'right', position: 12 },
      { id: 'gnd3', name: 'GND', type: 'ground', side: 'right', position: 13 }
    ],
    properties: {
      clockSpeed: 240, // MHz
      memory: 520, // KB
      flash: 4, // MB
      running: false
    },
    dimensions: { width: 120, height: 240 },
    defaultCode: `// ESP32 Example Code
#include <WiFi.h>

const char* ssid = "IoT_Network";
const char* password = "password123";

void setup() {
  Serial.begin(115200);
  delay(10);
  
  // Initialize pins
  pinMode(2, OUTPUT); // Built-in LED
  
  // Connect to WiFi
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Blink the built-in LED
  digitalWrite(2, HIGH);
  Serial.println("LED ON");
  delay(1000);
  
  digitalWrite(2, LOW);
  Serial.println("LED OFF");
  delay(1000);
}`
  },
  // Arduino UNO Microcontroller
  {
    id: 'arduino-uno',
    name: 'Arduino UNO',
    type: 'controller',
    description: 'Popular microcontroller platform',
    image: 'microcontroller',
    ports: [
      // Power pins
      { id: 'vin', name: 'VIN', type: 'power', side: 'left', position: 0 },
      { id: 'gnd1', name: 'GND', type: 'ground', side: 'left', position: 1 },
      { id: 'gnd2', name: 'GND', type: 'ground', side: 'left', position: 2 },
      { id: '5v', name: '5V', type: 'power', side: 'left', position: 3 },
      { id: '3v3', name: '3.3V', type: 'power', side: 'left', position: 4 },
      { id: 'rst', name: 'RST', type: 'input', side: 'left', position: 5 },
      
      // Analog pins (left side)
      { id: 'a0', name: 'A0', type: 'input', dataType: 'analog', side: 'left', position: 6 },
      { id: 'a1', name: 'A1', type: 'input', dataType: 'analog', side: 'left', position: 7 },
      { id: 'a2', name: 'A2', type: 'input', dataType: 'analog', side: 'left', position: 8 },
      { id: 'a3', name: 'A3', type: 'input', dataType: 'analog', side: 'left', position: 9 },
      { id: 'a4', name: 'A4', type: 'input', dataType: 'analog', side: 'left', position: 10 },
      { id: 'a5', name: 'A5', type: 'input', dataType: 'analog', side: 'left', position: 11 },
      
      // Digital pins (right side)
      { id: 'd0', name: 'D0/RX', type: 'input', dataType: 'digital', side: 'right', position: 0 },
      { id: 'd1', name: 'D1/TX', type: 'output', dataType: 'digital', side: 'right', position: 1 },
      { id: 'd2', name: 'D2', type: 'input', dataType: 'digital', side: 'right', position: 2 },
      { id: 'd3', name: 'D3', type: 'output', dataType: 'digital', side: 'right', position: 3 },
      { id: 'd4', name: 'D4', type: 'input', dataType: 'digital', side: 'right', position: 4 },
      { id: 'd5', name: 'D5', type: 'output', dataType: 'digital', side: 'right', position: 5 },
      { id: 'd6', name: 'D6', type: 'output', dataType: 'digital', side: 'right', position: 6 },
      { id: 'd7', name: 'D7', type: 'input', dataType: 'digital', side: 'right', position: 7 },
      { id: 'd8', name: 'D8', type: 'output', dataType: 'digital', side: 'right', position: 8 },
      { id: 'd9', name: 'D9', type: 'output', dataType: 'digital', side: 'right', position: 9 },
      { id: 'd10', name: 'D10', type: 'output', dataType: 'digital', side: 'right', position: 10 },
      { id: 'd11', name: 'D11', type: 'output', dataType: 'digital', side: 'right', position: 11 },
      { id: 'd12', name: 'D12', type: 'input', dataType: 'digital', side: 'right', position: 12 },
      { id: 'd13', name: 'D13', type: 'output', dataType: 'digital', side: 'right', position: 13 }
    ],
    properties: {
      clockSpeed: 16, // MHz
      memory: 32, // KB
      running: false
    },
    dimensions: { width: 120, height: 220 },
    defaultCode: `// Arduino UNO Example Code
const int ledPin = 13;  // Built-in LED

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  
  // Initialize pins
  pinMode(ledPin, OUTPUT);
  pinMode(2, INPUT);  // Button input on pin 2
  
  Serial.println("Arduino initialized");
}

void loop() {
  // Read button state
  int buttonState = digitalRead(2);
  
  // If button pressed, turn on LED
  if (buttonState == HIGH) {
    digitalWrite(ledPin, HIGH);
    Serial.println("Button pressed - LED ON");
  } else {
    digitalWrite(ledPin, LOW);
    Serial.println("LED OFF");
  }
  
  delay(100);
}`
  },
  {
    id: 'lcd-display',
    name: 'LCD Display',
    type: 'display',
    description: '16x2 character display',
    image: 'lcd-display',
    ports: [
      { id: 'vcc', name: 'VCC', type: 'power', side: 'left', position: 0 },
      { id: 'gnd', name: 'GND', type: 'ground', side: 'left', position: 1 },
      { id: 'sda', name: 'SDA', type: 'input', dataType: 'i2c', side: 'left', position: 2 },
      { id: 'scl', name: 'SCL', type: 'input', dataType: 'i2c', side: 'left', position: 3 }
    ],
    properties: {
      rows: 2,
      columns: 16,
      content: [
        "Hello World!",
        "IoT Simulator"
      ],
      backlight: true
    },
    dimensions: { width: 100, height: 60 },
    defaultCode: `// LCD Display Example
#include <LiquidCrystal_I2C.h>

// Initialize LCD (I2C address, columns, rows)
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Hello World!");
  lcd.setCursor(0, 1);
  lcd.print("IoT Simulator");
}

void loop() {
  // Update second line with a counter
  static int counter = 0;
  lcd.setCursor(10, 1);
  lcd.print(counter);
  counter++;
  
  delay(1000);
}`
  },
  {
    id: 'wifi-module',
    name: 'WiFi Module',
    type: 'communication',
    description: 'Connects device to WiFi network',
    image: 'wifi-module',
    ports: [
      { id: 'vcc', name: 'VCC', type: 'power', side: 'left', position: 0 },
      { id: 'gnd', name: 'GND', type: 'ground', side: 'left', position: 1 },
      { id: 'tx', name: 'TX', type: 'output', dataType: 'uart', side: 'right', position: 0 },
      { id: 'rx', name: 'RX', type: 'input', dataType: 'uart', side: 'right', position: 1 }
    ],
    properties: {
      ssid: "IoT_Network",
      connected: false,
      ip: "192.168.1.100",
      signal: 75 // signal strength 0-100%
    },
    dimensions: { width: 80, height: 60 },
    defaultCode: `// WiFi Module Example
#include <WiFi.h>

const char* ssid = "IoT_Network";
const char* password = "password123";

void setup() {
  Serial.begin(115200);
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("Connected!");
  Serial.println("IP address: " + WiFi.localIP());
}

void loop() {
  // Check connection status periodically
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi signal: " + WiFi.RSSI() + " dBm");
  } else {
    Serial.println("Connection lost, reconnecting...");
    WiFi.reconnect();
  }
  
  delay(5000);
}`
  }
];

// Default workbench template for new projects
export const defaultWorkbench = {
  devices: [
    {
      instanceId: 'arduino-1',
      deviceId: 'arduino-uno',
      position: { x: 300, y: 200 },
      connections: []
    },
    {
      instanceId: 'temp-1',
      deviceId: 'temp-sensor',
      position: { x: 150, y: 100 },
      connections: []
    },
    {
      instanceId: 'led-1',
      deviceId: 'led',
      position: { x: 450, y: 100 },
      connections: []
    }
  ]
};
