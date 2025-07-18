import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Trophy, 
  Target, 
  Dumbbell, 
  Calendar,
  MapPin,
  Mail,
  Phone,
  Edit,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

const ProfileComplete: React.FC = () => {
  const navigate = useNavigate();
  const { appStoreUser } = useAppStore();

  // Calculate profile completion
  const calculateCompletion = () => {
    const fields = [
      appStoreUser.full_name,
      appStoreUser.email,
      appStoreUser.age,
      appStoreUser.gender,
      appStoreUser.sport,
      appStoreUser.height_cm,
      appStoreUser.weight_kg,
      appStoreUser.phone,
      appStoreUser.city,
      appStoreUser.bio
    ];
    
    const filledFields = fields.filter(field => field !== null && field !== undefined && field !== '');
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();
  const isComplete = completionPercentage === 100;

  const profileSections = [
    {
      title: 'Personal Information',
      icon: User,
      fields: [
        { label: 'Full Name', value: appStoreUser.full_name || '-', key: 'full_name' },
        { label: 'Email', value: appStoreUser.email || '-', key: 'email' },
        { label: 'Phone', value: appStoreUser.phone || '-', key: 'phone' },
        { label: 'Age', value: appStoreUser.age ? `${appStoreUser.age} years` : '-', key: 'age' },
        { label: 'Gender', value: appStoreUser.gender || '-', key: 'gender' }
      ]
    },
    {
      title: 'Physical Profile',
      icon: Dumbbell,
      fields: [
        { label: 'Height', value: appStoreUser.height_cm ? `${appStoreUser.height_cm} cm` : '-', key: 'height_cm' },
        { label: 'Weight', value: appStoreUser.weight_kg ? `${appStoreUser.weight_kg} kg` : '-', key: 'weight_kg' },
        { label: 'BMI', value: appStoreUser.height_cm && appStoreUser.weight_kg 
          ? `${(appStoreUser.weight_kg / Math.pow(appStoreUser.height_cm / 100, 2)).toFixed(1)}` 
          : '-', key: 'bmi' }
      ]
    },
    {
      title: 'Sports Profile',
      icon: Trophy,
      fields: [
        { label: 'Main Sport', value: appStoreUser.sport || '-', key: 'sport' },
        { label: 'Position', value: appStoreUser.sport_position || '-', key: 'sport_position' },
        { label: 'Level', value: appStoreUser.sport_level || '-', key: 'sport_level' },
        { label: 'Experience', value: appStoreUser.fitness_experience || '-', key: 'fitness_experience' }
      ]
    },
    {
      title: 'Goals & Preferences',
      icon: Target,
      fields: [
        { label: 'Primary Goals', value: appStoreUser.primary_goals?.join(', ') || '-', key: 'primary_goals' },
        { label: 'Training Frequency', value: appStoreUser.training_frequency ? `${appStoreUser.training_frequency} days/week` : '-', key: 'training_frequency' },
        { label: 'Active Modules', value: appStoreUser.active_modules?.join(', ') || '-', key: 'active_modules' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
          
          {/* Completion Status */}
          <Card className={`${isComplete ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {isComplete ? (
                    <>
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                      <span className="font-semibold text-green-900">Profile Complete!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-6 w-6 text-yellow-600" />
                      <span className="font-semibold text-yellow-900">Profile {completionPercentage}% Complete</span>
                    </>
                  )}
                </div>
                <Badge variant={isComplete ? "default" : "secondary"}>
                  {completionPercentage}%
                </Badge>
              </div>
              
              <Progress value={completionPercentage} className="h-2 mb-4" />
              
              {!isComplete && (
                <p className="text-sm text-gray-600">
                  Complete your profile to unlock personalized recommendations and better AI coaching.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Sections */}
        <div className="space-y-6">
          {profileSections.map((section, index) => {
            const SectionIcon = section.icon;
            const sectionFields = section.fields.filter(field => !field.value || field.value === '-');
            const isComplete = sectionFields.length === 0;
            
            return (
              <Card key={index} className={isComplete ? 'border-green-200' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <SectionIcon className="h-5 w-5 text-gray-600" />
                      <span>{section.title}</span>
                    </CardTitle>
                    {isComplete ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        {section.fields.filter(f => f.value !== '-').length}/{section.fields.length} fields
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.fields.map((field, fieldIndex) => (
                      <div key={fieldIndex} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">{field.label}</span>
                        <span className={`text-sm ${field.value === '-' ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>
                          {field.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button
            size="lg"
            onClick={() => navigate('/settings')}
            className="flex items-center"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          {isComplete && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Continue to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileComplete;
