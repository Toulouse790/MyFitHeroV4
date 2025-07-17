// client/src/components/USMarketDashboard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Droplets, 
  Dumbbell, 
  Target, 
  Flame, 
  Trophy,
  TrendingUp,
  Flag
} from 'lucide-react';
import { UnitDisplay } from '@/components/UnitDisplay';

interface USMarketDashboardProps {
  className?: string;
}

export const USMarketDashboard: React.FC<USMarketDashboardProps> = ({ className = '' }) => {

  // Données d'exemple pour la démonstration
  const mockStats = {
    weight: 155, // lbs (convertible)
    height: 5.75, // ft (convertible)
    waterIntake: 48, // fl oz (convertible)
    waterGoal: 64, // fl oz (convertible)
    caloriesBurned: 420,
    calorieGoal: 2200,
    workoutsThisWeek: 3,
    workoutGoal: 5,
    avgWorkoutTime: 45, // minutes
    streakDays: 7
  };

  const getMotivationalMessage = () => {
    const messages = [
      "You're crushing it! 🇺🇸",
      "Keep up the great work, champion!",
      "American strong! 💪",
      "On track to dominate your goals!",
      "Consistency is key - you've got this!",
      "Making America fitter, one workout at a time!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with US flag and motivational message */}
      <Card className="bg-gradient-to-r from-blue-600 to-red-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🇺🇸</span>
                <h2 className="text-xl font-bold">MyFitHero USA</h2>
              </div>
              <p className="text-blue-100">{getMotivationalMessage()}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{mockStats.streakDays}</div>
              <div className="text-sm text-blue-100">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid - US Units */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Weight Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Current Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              <UnitDisplay value={70} type="weight" />
            </div>
            <p className="text-xs text-gray-500">
              Goal: <UnitDisplay value={65} type="weight" />
            </p>
          </CardContent>
        </Card>

        {/* Height Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Height
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <UnitDisplay value={175} type="height" />
            </div>
            <p className="text-xs text-gray-500">
              BMI: 22.9 (Normal)
            </p>
          </CardContent>
        </Card>

        {/* Hydration Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Water Intake
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">
              <UnitDisplay value={1420} type="liquid" />
            </div>
            <p className="text-xs text-gray-500">
              Goal: <UnitDisplay value={1900} type="liquid" />
            </p>
            <Progress 
              value={(1420 / 1900) * 100} 
              className="mt-2 h-1" 
            />
          </CardContent>
        </Card>

        {/* Workout Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {mockStats.workoutsThisWeek}/{mockStats.workoutGoal}
            </div>
            <p className="text-xs text-gray-500">
              Avg: {mockStats.avgWorkoutTime} min
            </p>
            <Progress 
              value={(mockStats.workoutsThisWeek / mockStats.workoutGoal) * 100} 
              className="mt-2 h-1" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - US Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Droplets className="h-5 w-5" />
              <span className="text-xs">Add 8 fl oz</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Droplets className="h-5 w-5" />
              <span className="text-xs">Add 16 fl oz</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Dumbbell className="h-5 w-5" />
              <span className="text-xs">Log Workout</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <Target className="h-5 w-5" />
              <span className="text-xs">Update Weight</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Workouts Completed</span>
                <Badge variant="outline">{mockStats.workoutsThisWeek}/5</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Calories Burned</span>
                <Badge variant="outline">{mockStats.caloriesBurned}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Water Goal Hit</span>
                <Badge variant="outline">5/7 days</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg Workout Time</span>
                <Badge variant="outline">{mockStats.avgWorkoutTime} min</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  🏆
                </div>
                <div>
                  <p className="text-sm font-medium">Week Warrior</p>
                  <p className="text-xs text-gray-500">Completed 5 workouts this week</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  💧
                </div>
                <div>
                  <p className="text-sm font-medium">Hydration Hero</p>
                  <p className="text-xs text-gray-500">7-day water intake streak</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  🎯
                </div>
                <div>
                  <p className="text-sm font-medium">Goal Getter</p>
                  <p className="text-xs text-gray-500">Hit your weekly target</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* US-Specific Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            American Fitness Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">💧 Stay Hydrated</h4>
              <p className="text-sm text-blue-700">
                Aim for 8-10 glasses (64-80 fl oz) of water daily. More if you're active or in hot weather.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🏃‍♂️ Move More</h4>
              <p className="text-sm text-green-700">
                The CDC recommends 150 minutes of moderate exercise per week. That's just 21 minutes a day!
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">💪 Strength Training</h4>
              <p className="text-sm text-purple-700">
                Include 2-3 strength training sessions per week targeting all major muscle groups.
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">😴 Rest & Recovery</h4>
              <p className="text-sm text-orange-700">
                Aim for 7-9 hours of sleep nightly. Your body repairs and grows stronger during rest.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
