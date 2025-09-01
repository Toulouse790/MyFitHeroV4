// Types pour la feature Wearables
export interface WearableDevice {
  id: string;
  type: 'fitbit' | 'garmin' | 'apple_watch' | 'whoop' | 'samsung' | 'polar';
  name: string;
  status: 'connected' | 'syncing' | 'disconnected' | 'error';
  lastSync: Date;
  battery?: number;
  data: DeviceData;
}

export interface DeviceData {
  steps?: number;
  heartRate?: HeartRateData;
  sleep?: SleepData;
  calories?: number;
  distance?: number;
  activeMinutes?: number;
}

export interface HeartRateData {
  current: number;
  resting: number;
  max: number;
  zones: HeartRateZone[];
}

export interface HeartRateZone {
  name: string;
  min: number;
  max: number;
  minutes: number;
}

export interface SleepData {
  totalSleep: number;
  deepSleep: number;
  lightSleep: number;
  remSleep: number;
  efficiency: number;
  bedTime: Date;
  wakeTime: Date;
}
