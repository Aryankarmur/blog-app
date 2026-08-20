const EmptyState = ({ message = "No data found", title = "Nothing here" }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-3xl) var(--space-md)',
      textAlign: 'center',
      color: 'var(--color-text-muted)'
    }}>
      <h3 style={{ color: 'var(--color-text)', marginBottom: 'var(--space-sm)' }}>{title}</h3>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;
