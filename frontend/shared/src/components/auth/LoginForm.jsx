import React, { useState } from 'react';
import { login } from '../../api/authClient.js';

/**
 * Reusable Login Form Component
 * Allows login using Email OR Admission Number + password.
 * 
 * @param {Object} props
 * @param {Function} props.onSuccess - (user, token) => void
 * @param {Function} [props.onToggleRegister] - Optional callback to switch to register view
 */
export default function LoginForm({ onSuccess, onToggleRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login({ email, password });
      setLoading(false);
      if (onSuccess) {
        onSuccess(data.user, data.token);
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-form-container">
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '22px',
        fontWeight: '500',
        color: 'var(--ink)',
        marginBottom: '6px'
      }}>
        Sign In to ProjectMatch
      </h3>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '13.5px',
        color: 'var(--ink-soft)',
        marginBottom: '20px'
      }}>
        Enter your registered email or admission number and password.
      </p>

      {error && (
        <div style={{
          background: 'rgba(196, 18, 48, 0.08)',
          border: '1px solid var(--pine)',
          color: 'var(--pine)',
          padding: '10px 14px',
          borderRadius: 'var(--radius)',
          fontSize: '13px',
          marginBottom: '16px',
          fontFamily: 'var(--font-body)',
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{
            display: 'block',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--ink-soft)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.03em'
          }}>
            Email Address or Admission No
          </label>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@gmail.com or 24BTCSE0123"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius)',
              background: 'var(--paper-2)',
              border: '1px solid var(--paper-line)',
              color: 'var(--ink)',
              fontFamily: 'var(--font-body)',
              fontSize: '14.5px',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--ink-soft)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.03em'
          }}>
            Password
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 42px 10px 14px',
                borderRadius: 'var(--radius)',
                background: 'var(--paper-2)',
                border: '1px solid var(--paper-line)',
                color: 'var(--ink)',
                fontFamily: 'var(--font-body)',
                fontSize: '14.5px',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                padding: '4px',
                color: 'var(--ink-mute)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {showPassword ? (
                /* Eye Off Icon */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                /* Eye Visible Icon */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            marginTop: '8px',
            padding: '12px 20px',
            fontSize: '14px'
          }}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      {onToggleRegister && (
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13.5px', color: 'var(--ink-soft)' }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onToggleRegister}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--pine)',
              fontWeight: '500',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontFamily: 'var(--font-body)',
            }}
          >
            Register New Account
          </button>
        </div>
      )}
    </div>
  );
}
