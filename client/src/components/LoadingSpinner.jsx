import React from 'react';

export default function LoadingSpinner({ fullScreen = true }) {
  return (
    <div style={{ 
        minHeight: fullScreen ? '100vh' : 'auto', 
        backgroundColor: fullScreen ? '#121215' : 'transparent',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: fullScreen ? '0' : '40px'
    }}>
      <div style={{
          width: '40px', 
          height: '40px', 
          borderRadius: '50%',
          border: '3px solid rgba(255,255,255,0.1)', 
          borderTopColor: '#3b82f6',
          animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
