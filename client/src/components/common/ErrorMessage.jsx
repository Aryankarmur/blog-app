const ErrorMessage = ({ message }) => {
  if (!message) return null;
  
  return (
    <div style={{
      backgroundColor: 'var(--color-error)',
      color: '#fff',
      padding: 'var(--space-md)',
      borderRadius: 'var(--radius-md)',
      marginBottom: 'var(--space-md)',
      fontSize: 'var(--font-sm)'
    }}>
      {message}
    </div>
  );
};

export default ErrorMessage;
