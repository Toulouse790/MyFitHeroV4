import React, { useState } from 'react';

// components/UserProfileTabs.tsx
const tabs = [
  { id: 'general', label: 'Général' },
  { id: 'goals', label: 'Objectifs' },
  { id: 'recovery', label: 'Récupération' },
  { id: 'settings', label: 'Paramètres' }
];

interface UserProfileTabsProps {
  className?: string;
  onTabChange?: (tabId: string) => void;
}

const UserProfileTabs: React.FC<UserProfileTabsProps> = ({ 
  className = '',
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState('general');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm ${className}`}>
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="p-6">
        {activeTab === 'general' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
            <p className="text-gray-600">Contenu de l'onglet général...</p>
          </div>
        )}
        
        {activeTab === 'goals' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Objectifs</h3>
            <p className="text-gray-600">Contenu de l'onglet objectifs...</p>
          </div>
        )}
        
        {activeTab === 'recovery' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Récupération</h3>
            <p className="text-gray-600">Contenu de l'onglet récupération...</p>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div>
            <h3 className="text-lg font-semiblient mb-4">Paramètres</h3>
            <p className="text-gray-600">Contenu de l'onglet paramètres...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileTabs;
