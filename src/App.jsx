import { useState } from 'react';

function App() {
  const [contador, setContador] = useState(0);

  return (
    <div style={{ 
      padding: '24px', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '40px 32px',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        width: '100%',
        maxWidth: '360px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>✅</div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          Sistema de Registros
        </h1>
        <p style={{ fontSize: '14px', color: '#93c5fd', marginBottom: '32px' }}>
          APK compilado desde GitHub Actions
        </p>
        
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
            Contador de prueba
          </p>
          <p style={{ fontSize: '48px', fontWeight: 'bold' }}>{contador}</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setContador(contador - 1)}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            −
          </button>
          <button
            onClick={() => setContador(contador + 1)}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#22c55e',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            +
          </button>
        </div>

        <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '24px' }}>
          Si ves esto, la compilación funcionó correctamente
        </p>
      </div>
    </div>
  );
}

export default App;
