// routes/NavigationMenu.tsx
import React from 'react';
import { useCurrentRoute, useAppNavigation, useNavigationRoutes } from './hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu } from 'lucide-react';

interface NavigationMenuProps {
  className?: string;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ className }) => {
  const { currentRoute } = useCurrentRoute();
  const { navigateTo } = useAppNavigation();

  // Routes organisées par catégories
  const dashboardRoutes = useNavigationRoutes('dashboard');
  const fitnessRoutes = useNavigationRoutes('fitness');
  const wellnessRoutes = useNavigationRoutes('wellness');
  const socialRoutes = useNavigationRoutes('social');

  const handleNavigation = (path: string) => {
    navigateTo(path);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Menu className="h-4 w-4 mr-2" />
          Navigation
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        {/* Dashboard */}
        <DropdownMenuLabel className="flex items-center justify-between">
          Dashboard
          <Badge variant="outline" className="text-xs">
            {dashboardRoutes.length}
          </Badge>
        </DropdownMenuLabel>
        {dashboardRoutes.map(route => (
          <DropdownMenuItem
            key={route.path}
            onClick={() => handleNavigation(route.path)}
            className={currentRoute?.path === route.path ? 'bg-blue-50' : ''}
          >
            <span>{route.metadata?.title || route.path}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Fitness */}
        <DropdownMenuLabel className="flex items-center justify-between">
          Fitness
          <Badge variant="outline" className="text-xs">
            {fitnessRoutes.length}
          </Badge>
        </DropdownMenuLabel>
        {fitnessRoutes.slice(0, 4).map(route => (
          <DropdownMenuItem
            key={route.path}
            onClick={() => handleNavigation(route.path)}
            className={currentRoute?.path === route.path ? 'bg-green-50' : ''}
          >
            <span>{route.metadata?.title || route.path}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Wellness */}
        <DropdownMenuLabel className="flex items-center justify-between">
          Bien-être
          <Badge variant="outline" className="text-xs">
            {wellnessRoutes.length}
          </Badge>
        </DropdownMenuLabel>
        {wellnessRoutes.map(route => (
          <DropdownMenuItem
            key={route.path}
            onClick={() => handleNavigation(route.path)}
            className={currentRoute?.path === route.path ? 'bg-purple-50' : ''}
          >
            <span>{route.metadata?.title || route.path}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Social */}
        <DropdownMenuLabel className="flex items-center justify-between">
          Social
          <Badge variant="outline" className="text-xs">
            {socialRoutes.length}
          </Badge>
        </DropdownMenuLabel>
        {socialRoutes.slice(0, 2).map(route => (
          <DropdownMenuItem
            key={route.path}
            onClick={() => handleNavigation(route.path)}
            className={currentRoute?.path === route.path ? 'bg-orange-50' : ''}
          >
            <span>{route.metadata?.title || route.path}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavigationMenu;
