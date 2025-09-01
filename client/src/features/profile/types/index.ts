// Types pour le module Profile

export interface ProfileData {
  id?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileConfig {
  isEnabled: boolean;
  settings: Record<string, unknown>;
}

export interface ProfileStats {
  totalCount: number;
  averageValue: number;
  lastUpdate: string;
}

export interface CreateProfileDTO {
  userId: string;
  data: Record<string, unknown>;
}

export interface UpdateProfileDTO {
  data: Partial<Record<string, unknown>>;
}

export interface ProfileResponse {
  success: boolean;
  data: ProfileData;
  message?: string;
}
