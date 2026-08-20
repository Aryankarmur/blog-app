const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-md)',
    fontWeight: 'var(--font-weight-medium)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--color-accent)',
      color: '#fff', // always white text for accent button for contrast
    },
    secondary: {
      backgroundColor: 'var(--color-surface-muted)',
      color: 'var(--color-text)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-text)',
      border: '1px solid var(--color-border)',
    },
  };

  const sizes = {
    sm: { padding: 'var(--space-xs) var(--space-sm)', fontSize: 'var(--font-sm)' },
    md: { padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--font-md)' },
    lg: { padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-lg)' },
  };

  const mergedStyles = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
  };

  return (
    <button style={mergedStyles} className={className} {...props}>
      {children}
    </button>
  );
};

export default Button;
