const Input = ({ label, id, error, className = '', ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)' }} className={className}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 'var(--font-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
          {label}
        </label>
      )}
      <input
        id={id}
        style={{
          padding: 'var(--space-sm) var(--space-md)',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          fontSize: 'var(--font-md)',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        {...props}
      />
      {error && (
        <span style={{ color: 'var(--color-error)', fontSize: 'var(--font-xs)' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
