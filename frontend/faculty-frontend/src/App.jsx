import React, { useEffect, useState } from 'react';
import {
  AuthProvider,
  useAuth,
  catchSSOToken,
  redirectToPortal,
  SplitAuthPage,
  dbuuLogo,
} from '@projectmatch/shared';

function FacultyMainApp() {
  const { user, logout } = useAuth();

  useEffect(() => {
    window.history.replaceState(null, '', '/dashboard');
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2, #F8F9FA)', color: 'var(--ink, #1A1A1A)' }}>
      {/* Brand App Bar */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.1)', padding: '0 28px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={dbuuLogo}
            alt="DBUU Logo"
            style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #C41230' }}
          />
          <span style={{ fontFamily: 'Georgia, serif', fontWeight: '600', fontSize: '18px', color: '#16214A' }}>
            ProjectMatch
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666', border: '1px solid #DDD', padding: '3px 8px', borderRadius: '4px' }}>
            FACULTY MENTOR &bull; SOEC
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '13.5px', fontWeight: '600' }}>Prof. {user?.name}</span>
          <button onClick={logout} style={{ fontSize: '13px', color: '#C41230', cursor: 'pointer', border: 'none', background: 'none' }}>
            Log out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: '#16214A', marginBottom: '8px' }}>
          Welcome, Prof. {user?.name?.split(' ')[0]}.
        </h1>
        <p style={{ color: 'var(--ink-soft, #555)', fontSize: '14.5px', marginBottom: '28px' }}>
          School of Engineering & Computing &bull; Faculty Mentorship & Project Queue Workspace
        </p>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎓</div>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#16214A', marginBottom: '8px' }}>
            Faculty Mentor Workspace Active
          </h3>
          <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '520px', margin: '0 auto 20px' }}>
            Review incoming student team mentorship proposals, list new minor/major capstones for the SOEC project pool, and schedule review milestones.
          </p>
        </div>
      </div>
    </div>
  );
}

function FacultyPortalGate() {
  const { user, loading } = useAuth();

  useEffect(() => {
    document.title = "Faculty Mentor Portal — DBUU ProjectMatch";
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = dbuuLogo;

    catchSSOToken();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: '#16214A' }}>
        ⚡ Verifying DBUU Faculty Session...
      </div>
    );
  }

  if (user) {
    if (user.role !== 'faculty') {
      const storedToken = localStorage.getItem('projectmatch_token');
      redirectToPortal(user.role, storedToken);
      return null;
    }
    return <FacultyMainApp />;
  }

  window.history.replaceState(null, '', '/auth');

  return (
    <SplitAuthPage
      portalName="Faculty Mentor Portal"
      initialRole="faculty"
      defaultMode="login"
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FacultyPortalGate />
    </AuthProvider>
  );
}
