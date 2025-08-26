// types/onboarding.ts
export interface Position {
  id: string;
  name: string;
  description?: string;
  category?: string;
  sport?: string;
}

export interface PositionWithMetadata extends Position {
  popularity?: number;
  isCustom?: boolean;
  metadata?: {
    usage_count?: number;
    last_used?: string;
    category_rank?: number;
  };
}

export interface PositionState {
  filteredPositions: PositionWithMetadata[];
  showCustomInput: boolean;
  customPosition: string;
  searchQuery: string;
  suggestions: PositionWithMetadata[];
  analyticsData: {
    searchStartTime: number;
    searchDuration: number;
    totalPositionsViewed: number;
    customPositionUsed: boolean;
  };
}

export interface UseDebounceReturn<T> {
  value: T;
  isDebouncing: boolean;
}

export interface PositionSelectorProps {
  selectedPosition?: string;
  onPositionSelect: (position: string, isCustom?: boolean) => void;
  sport?: string;
  className?: string;
  placeholder?: string;
  allowCustomPosition?: boolean;
  showAnalytics?: boolean;
}

// Types pour les sports
export interface SportOption {
  id: string | number;
  name: string;
  label?: string;
  category?: string;
  icon?: string;
  description?: string;
  popularity?: number;
}
