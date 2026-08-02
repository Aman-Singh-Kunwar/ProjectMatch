import React, { useState } from 'react';
import { dbuuLogo, LoginForm, RegisterForm, redirectToPortal } from '@projectmatch/shared';

export default function AuthModal({ showLoginModal, setShowLoginModal, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);

  if (!showLoginModal) return null;

  const handleSuccess = (user, token) => {
    // Landing page's only job: authenticate and forward to the correct role portal
    redirectToPortal(user.role, token);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(16, 22, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem 1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowLoginModal(false);
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '88vh',
          overflowY: 'auto',
          padding: '24px 28px',
          position: 'relative',
          background: 'var(--surface)',
          border: '1px solid var(--paper-line)',
          borderTop: '4px solid var(--pine)',
          borderRadius: '12px',
          color: 'var(--ink)',
          boxShadow: '0 24px 56px rgba(0,0,0,0.35)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setShowLoginModal(false)}
          aria-label="Close Modal"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'var(--paper-2)',
            border: '1px solid var(--paper-line)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: 'var(--ink-soft)',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          ✕
        </button>

        {/* Modal Top Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
          <img
            src={dbuuLogo}
            alt="DBUU Logo"
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--pine)' }}
          />
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--pine)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>
              DBUU SINGLE SIGN-ON
            </span>
            <p style={{ fontSize: '11px', color: 'var(--ink-mute)', margin: 0 }}>
              Multi-Portal Capstone Gateway
            </p>
          </div>
        </div>

        {/* Auth Forms (Login / Register) */}
        {mode === 'login' ? (
          <LoginForm
            onSuccess={handleSuccess}
            onToggleRegister={() => setMode('register')}
          />
        ) : (
          <RegisterForm
            onSuccess={handleSuccess}
            onToggleLogin={() => setMode('login')}
          />
        )}
      </div>
    </div>
  );
}
