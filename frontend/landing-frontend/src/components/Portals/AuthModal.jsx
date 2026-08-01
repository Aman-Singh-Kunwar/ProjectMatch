import React from 'react';
import { dbuuLogo } from '@projectmatch/shared';
import { DBUU_PROJECT_SCHOOLS } from '../../data/schoolsData';

export default function AuthModal({
  showLoginModal,
  setShowLoginModal,
  authMode,
  setAuthMode,
  selectedRole,
  selectedSchool,
  setSelectedSchool,
  formData,
  setFormData,
  authError,
  submitting,
  handleDirectAuth,
}) {
  if (!showLoginModal) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2rem',
          position: 'relative',
          background: 'var(--surface)',
          border: '1px solid var(--paper-line)',
          borderRadius: '6px',
          color: 'var(--ink)',
        }}
      >
        <button
          onClick={() => setShowLoginModal(false)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--ink-mute)',
            fontSize: '1.25rem',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
          <img src={dbuuLogo} alt="DBUU Logo" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: '500' }}>
            {authMode === 'login' ? 'DBUU Portal Sign-In' : 'Register New Account'}
          </h3>
        </div>

        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-soft)', fontSize: '0.8rem', marginBottom: '1.25rem', textTransform: 'uppercase' }}>
          Portal: <strong>{selectedRole}</strong>
        </p>

        {authError && (
          <div
            style={{
              background: 'rgba(196, 18, 48, 0.1)',
              border: '1px solid var(--pine)',
              color: 'var(--pine)',
              padding: '0.65rem',
              borderRadius: '3px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            {authError}
          </div>
        )}

        <form onSubmit={handleDirectAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {authMode === 'register' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-soft)', marginBottom: '0.35rem' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aman Singh"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '3px',
                    background: 'var(--paper-2)',
                    border: '1px solid var(--paper-line)',
                    color: 'var(--ink)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-soft)', marginBottom: '0.35rem' }}>DBUU Project School</label>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '3px',
                    background: 'var(--paper-2)',
                    border: '1px solid var(--paper-line)',
                    color: 'var(--ink)',
                    fontSize: '0.9rem',
                  }}
                >
                  {DBUU_PROJECT_SCHOOLS.map((s) => (
                    <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-soft)', marginBottom: '0.35rem' }}>Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@dbuu.ac.in"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '3px',
                background: 'var(--paper-2)',
                border: '1px solid var(--paper-line)',
                color: 'var(--ink)',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-soft)', marginBottom: '0.35rem' }}>Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '3px',
                background: 'var(--paper-2)',
                border: '1px solid var(--paper-line)',
                color: 'var(--ink)',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem', width: '100%' }}>
            {submitting ? 'Authenticating...' : authMode === 'login' ? `Sign In & Open ${selectedRole} Portal` : `Create ${selectedRole} Account`}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
          {authMode === 'login' ? (
            <>
              Need a DBUU account?{' '}
              <button
                onClick={() => setAuthMode('register')}
                style={{ background: 'none', border: 'none', color: 'var(--pine)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setAuthMode('login')}
                style={{ background: 'none', border: 'none', color: 'var(--pine)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
