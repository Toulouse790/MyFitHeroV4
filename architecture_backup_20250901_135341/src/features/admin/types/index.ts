// Types pour le module Admin

export interface AdminData {
  id?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminConfig {
  isEnabled: boolean;
  settings: Record<string, unknown>;
}

export interface AdminStats {
  totalCount: number;
  averageValue: number;
  lastUpdate: string;
}

export interface CreateAdminDTO {
  userId: string;
  data: Record<string, unknown>;
}

export interface UpdateAdminDTO {
  data: Partial<Record<string, unknown>>;
}

export interface AdminResponse {
  success: boolean;
  data: AdminData;
  message?: string;
}
