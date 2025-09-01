// Types pour la feature AI Coach
export interface CoachingSession {
  id: string;
  userId: string;
  topic: string;
  messages: Message[];
  recommendations: Recommendation[];
  plan?: PersonalizedPlan;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  confidence?: number;
  sources?: string[];
  actionItems?: string[];
}

export interface Recommendation {
  id: string;
  type: 'workout' | 'nutrition' | 'recovery' | 'lifestyle';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  estimatedImpact: number;
}

export interface PersonalizedPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // en jours
  goals: string[];
  phases: PlanPhase[];
  createdAt: Date;
}

export interface PlanPhase {
  id: string;
  name: string;
  description: string;
  duration: number; // en jours
  focus: string[];
  activities: PlannedActivity[];
}

export interface PlannedActivity {
  id: string;
  type: 'workout' | 'nutrition' | 'recovery' | 'education';
  title: string;
  description: string;
  scheduledFor: Date;
  completed: boolean;
}
