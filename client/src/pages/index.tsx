import React from 'react';

const IndexPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f0f0'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>
          🏋️‍♂️ MyFitHero V4
        </h1>
        <p>✅ Test réussi - React fonctionne !</p>
        <p>❌ Problème : hooks is not defined</p>
      </div>
    </div>
  );
};

export default IndexPage;
