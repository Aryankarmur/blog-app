import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ label, id, error, rightElement, className = '', type = 'text', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const togglePassword = (e) => {
    e.preventDefault();
    setShowPassword(prev => !prev);
  };

  const actualRightElement = isPassword ? (
    <button
      type="button"
      className="password-toggle-btn"
      onClick={togglePassword}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--text)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        outline: 'none',
        borderRadius: '4px'
      }}
      onFocus={(e) => e.target.style.outline = '2px solid var(--accent)'}
      onBlur={(e) => e.target.style.outline = 'none'}
      onMouseEnter={(e) => e.target.style.color = 'var(--text-h)'}
      onMouseLeave={(e) => e.target.style.color = 'var(--text)'}
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  ) : rightElement;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)', position: 'relative' }} className={className}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 'var(--font-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        <input
          type={inputType}
          id={id}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: 'var(--space-sm) var(--space-md)',
            paddingRight: actualRightElement ? '40px' : 'var(--space-md)',
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
        {actualRightElement && (
          <div style={{ position: 'absolute', right: '12px', display: 'flex', alignItems: 'center' }}>
            {actualRightElement}
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
