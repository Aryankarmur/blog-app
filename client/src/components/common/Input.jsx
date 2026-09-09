const Input = ({ label, id, error, rightElement, className = '', ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)', position: 'relative' }} className={className}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 'var(--font-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        <input
          id={id}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: 'var(--space-sm) var(--space-md)',
            paddingRight: rightElement ? '40px' : 'var(--space-md)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${error ? 'var(--color-error)' : 'var(--border)'}`,
            backgroundColor: 'var(--bg)',
            color: 'var(--text-h)',
            fontSize: 'var(--font-md)',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          {...props}
        />
        {rightElement && (
          <div style={{ position: 'absolute', right: '12px', display: 'flex', alignItems: 'center' }}>
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <span style={{ color: 'var(--color-error)', fontSize: 'var(--font-xs)' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
