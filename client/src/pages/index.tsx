// pages/index.tsx - VERSION ULTRA-SIMPLE QUI DOIT MARCHER
import React from 'react';

const IndexPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #fae8ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '400px'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏋️‍♂️</div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 8px 0'
          }}>
            MyFitHero V4
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Votre compagnon intelligent pour la santé
          </p>
        </div>

        {/* Onglets */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '24px'
        }}>
          <button style={{
            flex: 1,
            padding: '12px 24px',
            border: 'none',
            background: 'none',
            borderBottom: '2px solid #3b82f6',
            color: '#3b82f6',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Connexion
          </button>
          <button style={{
            flex: 1,
            padding: '12px 24px',
            border: 'none',
            background: 'none',
            color: '#6b7280',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Inscription
          </button>
        </div>

        {/* Formulaire */}
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email"
            placeholder="Email"
            required
            style={{
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
          
          <input
            type="password"
            placeholder="Mot de passe"
            required
            style={{
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
          
          <button
            type="submit"
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              marginTop: '8px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
            onClick={(e) => {
              e.preventDefault();
              alert('Formulaire de test soumis !');
            }}
          >
            Se connecter
          </button>
        </form>

        {/* Fonctionnalités */}
        <div style={{ 
          marginTop: '24px', 
          paddingTop: '24px', 
          borderTop: '1px solid #e5e7eb' 
        }}>
          <p style={{ 
            textAlign: 'center', 
            fontSize: '14px', 
            color: '#6b7280',
            marginBottom: '12px' 
          }}>
            Découvrez toutes les fonctionnalités :
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '8px',
            textAlign: 'center'
          }}>
            <div style={{
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
              backgroundColor: '#f9fafb'
            }}>
              🏋️ Workout IA
            </div>
            <div style={{
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
              backgroundColor: '#f9fafb'
            }}>
              📊 Analytics
            </div>
            <div style={{
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
              backgroundColor: '#f9fafb'
            }}>
              ⌚ Wearables
            </div>
            <div style={{
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
              backgroundColor: '#f9fafb'
            }}>
              🎯 Coaching
            </div>
          </div>
        </div>

        {/* Message d'encouragement */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
            Bon retour parmi nous ! Prêt pour votre prochaine session ?
          </p>
        </div>

        {/* Info de debug */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px',
          fontSize: '12px'
        }}>
          <p><strong>✅ Version ultra-simple chargée</strong></p>
          <p>Si vous voyez ceci, React fonctionne !</p>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
