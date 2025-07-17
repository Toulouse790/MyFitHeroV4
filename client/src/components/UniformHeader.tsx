// client/src/components/UniformHeader.tsx
import React from 'react';
import { ArrowLeft, Settings, Bell, User, Trophy, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useLocation } from 'wouter';

interface UniformHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showSettings?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  showStats?: boolean;
  showBadges?: boolean;
  onBack?: () => void;
  onSettings?: () => void;
  onNotifications?: () => void;
  onProfile?: () => void;
  onStats?: () => void;
  onBadges?: () => void;
  notificationCount?: number;
  className?: string;
  rightContent?: React.ReactNode;
  gradient?: boolean;
}

export const UniformHeader: React.FC<UniformHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  showSettings = false,
  showNotifications = false,
  showProfile = false,
  showStats = false,
  showBadges = false,
  onBack,
  onSettings,
  onNotifications,
  onProfile,
  onStats,
  onBadges,
  notificationCount = 0,
  className = '',
  rightContent,
  gradient = false
}) => {
  const [, navigate] = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleSettings = () => {
    if (onSettings) {
      onSettings();
    } else {
      navigate('/settings');
    }
  };

  const handleProfile = () => {
    if (onProfile) {
      onProfile();
    } else {
      navigate('/profile');
    }
  };

  const handleNotifications = () => {
    if (onNotifications) {
      onNotifications();
    } else {
      navigate('/notifications');
    }
  };

  const handleStats = () => {
    if (onStats) {
      onStats();
    } else {
      navigate('/analytics');
    }
  };

  const handleBadges = () => {
    if (onBadges) {
      onBadges();
    } else {
      navigate('/achievements');
    }
  };

  const headerClasses = `
    ${gradient 
      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
      : 'bg-white border-b border-gray-200'
    }
    ${className}
  `;

  return (
    <header className={headerClasses}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Section gauche */}
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className={`${gradient ? 'text-white hover:bg-white/20' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            
            <div>
              <h1 className={`text-lg font-semibold ${gradient ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h1>
              {subtitle && (
                <p className={`text-sm ${gradient ? 'text-white/80' : 'text-gray-600'}`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Section droite */}
          <div className="flex items-center space-x-2">
            {rightContent && (
              <div className="mr-2">
                {rightContent}
              </div>
            )}
            
            {showSettings && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSettings}
                className={`${gradient ? 'text-white hover:bg-white/20' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Settings className="w-5 h-5" />
              </Button>
            )}

            {showStats && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStats}
                className={`${gradient ? 'text-white hover:bg-white/20' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <TrendingUp className="w-5 h-5" />
              </Button>
            )}

            {showBadges && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBadges}
                className={`${gradient ? 'text-white hover:bg-white/20' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Trophy className="w-5 h-5" />
              </Button>
            )}

            {showNotifications && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNotifications}
                className={`relative ${gradient ? 'text-white hover:bg-white/20' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>
            )}

            {showProfile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProfile}
                className={`${gradient ? 'text-white hover:bg-white/20' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <User className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default UniformHeader;
