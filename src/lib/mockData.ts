// Mock data service – simulates real sensor readings & API responses

export const CROPS = ['wheat', 'corn', 'rice', 'tomato', 'potato'];

export const WEATHER_DATA = {
  current: {
    temp: 24 + Math.random() * 8,
    humidity: 55 + Math.random() * 20,
    windSpeed: 5 + Math.random() * 15,
    description: 'Partly Cloudy',
    precipitation: Math.random() * 5,
    uvIndex: 4 + Math.floor(Math.random() * 5),
  },
  forecast: Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
    high: 22 + Math.random() * 10,
    low: 14 + Math.random() * 8,
    rain: Math.random() > 0.6,
    rainMm: Math.random() * 12,
  })),
};

export const SENSOR_READINGS = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2,'0')}:00`,
  soilMoisture: 35 + Math.sin(i * 0.3) * 10 + Math.random() * 5,
  temperature: 18 + Math.sin(i * 0.26 - 1) * 7 + Math.random() * 2,
  humidity: 60 + Math.cos(i * 0.26) * 15 + Math.random() * 5,
  co2: 400 + Math.random() * 50,
}));

export const MARKET_PRICES: Record<string, { price: number; change: number; unit: string }> = {
  wheat:  { price: 220,  change: +2.1, unit: '$/ton' },
  corn:   { price: 185,  change: -0.8, unit: '$/ton' },
  rice:   { price: 310,  change: +1.4, unit: '$/ton' },
  tomato: { price: 890,  change: +5.2, unit: '$/ton' },
  potato: { price: 145,  change: -1.1, unit: '$/ton' },
};

export const DASHBOARD_METRICS = {
  totalFieldArea: 48.5,
  activeSensors: 128,
  predictedYield: 4.8,
  harvestDaysLeft: 38,
  waterUsedToday: 12400,
  energySaved: 22,
  cropHealthAvg: 87,
  alertCount: 3,
};

export const FIELD_ZONES = [
  { id: 'A1', label: 'Zone A1', soilMoisture: 42.5, nitrogen: 45, phosphorus: 22, potassium: 31, waterNeed: 'high',   fertNeed: 'low',    crop: 'corn',   health: 88, irrigationActive: true,  autoMode: true },
  { id: 'A2', label: 'Zone A2', soilMoisture: 58.2, nitrogen: 48, phosphorus: 24, potassium: 33, waterNeed: 'low',    fertNeed: 'low',    crop: 'corn',   health: 92, irrigationActive: false, autoMode: true },
  { id: 'A3', label: 'Zone A3', soilMoisture: 45.0, nitrogen: 35, phosphorus: 18, potassium: 28, waterNeed: 'medium', fertNeed: 'medium', crop: 'wheat',  health: 76, irrigationActive: false, autoMode: true },
  { id: 'A4', label: 'Zone A4', soilMoisture: 38.1, nitrogen: 42, phosphorus: 21, potassium: 30, waterNeed: 'high',   fertNeed: 'low',    crop: 'wheat',  health: 82, irrigationActive: true,  autoMode: true },
  { id: 'B1', label: 'Zone B1', soilMoisture: 62.4, nitrogen: 55, phosphorus: 28, potassium: 38, waterNeed: 'low',    fertNeed: 'low',    crop: 'tomato', health: 95, irrigationActive: false, autoMode: true },
  { id: 'B2', label: 'Zone B2', soilMoisture: 51.7, nitrogen: 51, phosphorus: 26, potassium: 35, waterNeed: 'medium', fertNeed: 'low',    crop: 'tomato', health: 89, irrigationActive: false, autoMode: true },
  { id: 'B3', label: 'Zone B3', soilMoisture: 44.3, nitrogen: 46, phosphorus: 23, potassium: 32, waterNeed: 'medium', fertNeed: 'medium', crop: 'rice',   health: 84, irrigationActive: false, autoMode: true },
  { id: 'B4', label: 'Zone B4', soilMoisture: 39.8, nitrogen: 38, phosphorus: 19, potassium: 29, waterNeed: 'high',   fertNeed: 'high',   crop: 'rice',   health: 79, irrigationActive: true,  autoMode: true },
];

export const ALERTS = [
  { id: 1, type: 'warning', title: 'Low Soil Moisture', desc: 'Zone B2 moisture below 25%', time: '2 min ago' },
  { id: 2, type: 'info',    title: 'Rain Forecast',     desc: 'Light rain expected tomorrow', time: '1 hr ago' },
  { id: 3, type: 'error',   title: 'Sensor Offline',    desc: 'Zone D4 sensor not responding', time: '3 hr ago' },
];

export const CROP_DISEASE_RESULTS = [
  { label: 'Healthy', confidence: 0.82, color: '#22c55e' },
  { label: 'Early Blight', confidence: 0.12, color: '#f59e0b' },
  { label: 'Leaf Rust', confidence: 0.06, color: '#f43f5e' },
];

export const ACTIVITIES = [
  { id:1, name:'Irrigate Zone A', start:6,  end:8,  zone:'A' },
  { id:2, name:'Spray Zone B',    start:7,  end:9,  zone:'B' },
  { id:3, name:'Harvest Zone C',  start:10, end:12, zone:'C' },
  { id:4, name:'Irrigate Zone D', start:11, end:13, zone:'D' },
  { id:5, name:'Fertilize Zone A',start:14, end:15, zone:'A' },
  { id:6, name:'Soil Test',       start:15, end:16, zone:'B' },
  { id:7, name:'Pest Control',    start:8,  end:11, zone:'C' },
];

export const JOBS = [
  { id:1, name:'Emergency Irrigation', deadline:2, profit:100 },
  { id:2, name:'Fertilizer Application',deadline:3, profit:80 },
  { id:3, name:'Pest Spray',           deadline:2, profit:90 },
  { id:4, name:'Soil Analysis',        deadline:4, profit:60 },
  { id:5, name:'Harvest Prep',         deadline:3, profit:70 },
];

export const RESOURCES = [
  { name:'Drip Irrigation Kit',  weight:4, value:50 },
  { name:'Nitrogen Fertilizer',  weight:3, value:40 },
  { name:'Pest Spray System',    weight:2, value:35 },
  { name:'Soil Sensor Array',    weight:5, value:60 },
  { name:'Solar Pump',           weight:6, value:70 },
  { name:'Weather Station',      weight:3, value:45 },
];

export const SENSOR_DATA_TEXT =
  'TEMP:24.5,MOIST:67.3,N:45,P:22,K:38,CO2:412,PH:6.8,LIGHT:820,WIND:12,RAIN:0';
