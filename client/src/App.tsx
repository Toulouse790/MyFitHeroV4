import React from 'react';
import { Router, Route } from 'wouter';

const App: React.FC = () => {
  console.log("🟢 Route actuelle:", window.location.pathname);
  
  return (
    <Router>
      {/* Page d'accueil */}
      <Route path="/">
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#dcfce7' // bg-green-100
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: '#16a34a', // text-green-600
              marginBottom: '1rem' 
            }}>
              ✅ Page d'ACCUEIL
            </h1>
            <p style={{ fontSize: '1.125rem' }}>Route : /</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem' }}>
              MyFitHero V4
            </p>
          </div>
        </div>
      </Route>

      {/* Page login */}
      <Route path="/login">
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', 
          backgroundColor: '#dbeafe' // bg-blue-100
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#2563eb', // text-blue-600
              marginBottom: '1rem'
            }}>
              🔐 Page de CONNEXION
            </h1>
            <p style={{ fontSize: '1.125rem' }}>Route : /login</p>
          </div>
        </div>
      </Route>

      {/* Page register */}
      <Route path="/register">
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3e8ff' // bg-purple-100
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#9333ea', // text-purple-600
              marginBottom: '1rem'
            }}>
              📝 Page d'INSCRIPTION
            </h1>
            <p style={{ fontSize: '1.125rem' }}>Route : /register</p>
          </div>
        </div>
      </Route>

      {/* Page 404 - sans path = catch-all */}
      <Route>
        {(params) => {
          // Cette route se déclenche si aucune autre ne correspond
          const currentPath = window.location.pathname;
          
          // Ne pas afficher 404 pour les routes connues
          if (currentPath === '/' || currentPath === '/login' || currentPath === '/register') {
            return null;
          }
          
          return (
            <div style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fecaca' // bg-red-100
            }}>
              <div style={{ textAlign: 'center' }}>
                <h1 style={{
                  fontSize: '4rem',
                  fontWeight: 'bold',
                  color: '#dc2626', // text-red-600
                  marginBottom: '1rem'
                }}>
                  🚨 404 - PAGE INTROUVABLE
                </h1>
                <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                  Cette page n'existe pas !
                </p>
                <p style={{
                  fontSize: '1.125rem',
                  backgroundColor: '#e5e7eb',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  display: 'inline-block',
                  marginBottom: '1.5rem'
                }}>
                  Route tentée : {currentPath}
                </p>
                <br />
                <button
                  onClick={() => window.location.href = '/'}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                >
                  🏠 Retour à l'accueil
                </button>
              </div>
            </div>
          );
        }}
      </Route>
    </Router>
  );
};

export default App;
