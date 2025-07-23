// WorkoutDashboard.tsx - Structure principale
const WorkoutDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'session', label: 'Entraînement', icon: '🏋️' },
    { id: 'plans', label: 'Plans', icon: '📋' },
    { id: 'progress', label: 'Progrès', icon: '📈' },
    { id: 'history', label: 'Historique', icon: '📅' },
    { id: 'settings', label: 'Réglages', icon: '⚙️' }
  ];
  
  return (
    <div className="workout-dashboard">
      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <TabContent activeTab={activeTab} />
    </div>
  );
};

