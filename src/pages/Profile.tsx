import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Edit,
  Camera,
  Trophy,
  Target,
  Calendar,
  Activity,
  Heart,
  Zap,
  Award,
  ChevronRight,
  Share2,
  Download,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Crown,
  Flame,
  TrendingUp,
  Dumbbell,
  Clock,
  Droplets
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('stats');

  // === CONNEXION AU STORE ===
  const {
    user,
    achievements,
    workoutSessions,
    hydrationEntries,
    getWeeklyStats,
    updateProfile,
    resetAllData
  } = useAppStore();

  // === DONNÉES CALCULÉES ===
  const weeklyStats = getWeeklyStats();
  const totalCaloriesBurned = workoutSessions.reduce((total, w) => total + w.calories, 0);
  const averageWorkoutTime = workoutSessions.length > 0 
    ? Math.round(workoutSessions.reduce((total, w) => total + w.duration, 0) / workoutSessions.length)
    : 0;
  
  // Calcul de la série actuelle (jours consécutifs avec au moins une action)
  const calculateStreak = () => {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toDateString();
      
      const hasActivity = 
        workoutSessions.some(w => new Date(w.date).toDateString() === dateString) ||
        hydrationEntries.some(h => new Date(h.time).toDateString() === dateString);
      
      if (hasActivity) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  // Stats pour affichage
  const stats = [
    { 
      label: 'Workouts terminés', 
      value: workoutSessions.length, 
      icon: D
