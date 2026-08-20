const LoadingSpinner = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--space-xl)' }}>
      <div 
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--color-surface-muted)',
          borderTop: '3px solid var(--color-accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingSpinner;
