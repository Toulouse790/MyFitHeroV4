// Types pour le module Landing

export interface LandingData {
  id?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LandingConfig {
  isEnabled: boolean;
  settings: Record<string, unknown>;
}

export interface LandingStats {
  totalCount: number;
  averageValue: number;
  lastUpdate: string;
}

export interface CreateLandingDTO {
  userId: string;
  data: Record<string, unknown>;
}

export interface UpdateLandingDTO {
  data: Partial<Record<string, unknown>>;
}

export interface LandingResponse {
  success: boolean;
  data: LandingData;
  message?: string;
}
