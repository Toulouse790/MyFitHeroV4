import React from 'react';
import { Router, Route } from 'wouter';

// Import direct de votre page d'accueil
import IndexPage from '@/pages/index';

const App: React.FC = () => {
  return (
    <Router>
      <Route path="/">
        <IndexPage />
      </Route>
      <Route>
        <div>Page 404</div>
      </Route>
    </Router>
  );
};

export default App;
