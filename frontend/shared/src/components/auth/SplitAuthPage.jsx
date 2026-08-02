import React, { useState } from 'react';
import { dbuuLogoBig, login, register, redirectToPortal, useAuth } from '@projectmatch/shared';

export default function SplitAuthPage({ portalName = 'Student Portal', initialRole = 'student', defaultMode = 'login' }) {
  const { setTokenAndUser } = useAuth ? useAuth() : { setTokenAndUser: null };
  const [mode, setMode] = useState(defaultMode); // 'login' or 'register'
  const [role, setRole] = useState(initialRole); // 'student' or 'faculty'

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regAdmissionNo, setRegAdmissionNo] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  const handleSuccess = (user, token) => {
    if (setTokenAndUser) {
      setTokenAndUser(token, user);
    } else {
      redirectToPortal(user.role, token);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const data = await login({ email: loginEmail, password: loginPassword });
      setLoginLoading(false);
      handleSuccess(data.user, data.token);
    } catch (err) {
      setLoginLoading(false);
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);
    try {
      const payload = {
        name: regName,
        email: regEmail,
        password: regPassword,
        role,
        ...(role === 'student' ? { admissionNo: regAdmissionNo.trim() } : {}),
      };

      const data = await register(payload);
      setRegLoading(false);
      handleSuccess(data.user, data.token);
    } catch (err) {
      setRegLoading(false);
      setRegError(err.message || 'Registration failed. Please try again.');
    }
  };

  const isRegister = mode === 'register';

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #0A0F24 0%, #16214A 50%, #0D142E 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        perspective: '1200px', // Enables 3D parallax depth for smooth card slide
      }}
    >
      {/* Outer Split Card Container */}
      <div
        style={{
          width: '940px',
          maxWidth: '96vw',
          height: '630px',
          maxHeight: '94vh',
          borderRadius: '20px',
          overflow: 'hidden',
          position: 'relative',
          background: '#FFFFFF',
          boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          display: 'flex',
        }}
      >
        {/* HERO GRAPHIC PANEL (Sliding Crimson Red Context Side with 3D Momentum Easing) */}
        <div
          style={{
            width: '46%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 10,
            background: isRegister
              ? 'linear-gradient(155deg, #8B0E23 0%, #C41230 50%, #7A0A1D 100%)'
              : 'linear-gradient(155deg, #7A0A1D 0%, #C41230 60%, #9A0E26 100%)',
            color: '#FFFFFF',
            padding: '38px 34px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transform: isRegister ? 'translateX(117.4%)' : 'translateX(0%)',
            transition: 'transform 0.65s cubic-bezier(0.77, 0, 0.175, 1), background 0.65s ease',
            boxShadow: isRegister
              ? '-12px 0 36px rgba(0, 0, 0, 0.35)'
              : '12px 0 36px rgba(0, 0, 0, 0.35)',
          }}
        >
          {/* Subtle Topographic Dots Accent */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.12,
              backgroundImage: 'radial-gradient(#FFFFFF 1.2px, transparent 1.2px)',
              backgroundSize: '22px 22px',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* DBUU Top Pill Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.16)',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '10.5px',
                fontWeight: '600',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '20px',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              🎓 DEV BHOOMI UTTARAKHAND UNIVERSITY
            </div>

            {/* Display Headline with Smooth Fade/Slide Stagger */}
            <h2
              style={{
                fontFamily: 'var(--font-display, Georgia)',
                fontSize: '31px',
                fontWeight: '600',
                lineHeight: 1.16,
                letterSpacing: '-0.01em',
                marginBottom: '12px',
                color: '#FFFFFF',
                transition: 'transform 0.4s ease, opacity 0.4s ease',
              }}
            >
              {portalName} <span style={{ color: '#FFD700', textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>System</span>
            </h2>

            {/* Description Subtitle */}
            <p
              style={{
                fontFamily: 'var(--font-body, sans-serif)',
                fontSize: '13.5px',
                color: 'rgba(255, 255, 255, 0.92)',
                lineHeight: 1.55,
                maxWidth: '34ch',
                marginBottom: '20px',
              }}
            >
              {isRegister
                ? 'Register your account to access university capstones, form team proposals, and connect with faculty mentors across all SOEC departments.'
                : 'Welcome to your academic workspace. Design, analyze, map outcomes, and manage automated review queues across all departments.'}
            </p>

            {/* ENHANCED CONTEXT SIDE SWITCH CARD WITH HOVER EFFECT */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.15)',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <p style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.95)', marginBottom: '8px', fontWeight: '500' }}>
                {isRegister ? 'Already registered with ProjectMatch?' : "Don't have an account yet?"}
              </p>
              <button
                type="button"
                onClick={() => setMode(isRegister ? 'login' : 'register')}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: '#FFFFFF',
                  color: '#C41230',
                  border: 'none',
                  padding: '9.5px 16px',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.28)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.2)';
                }}
              >
                {isRegister ? '← Sign In to Account' : 'Register New Account →'}
              </button>
            </div>
          </div>

          {/* Bottom Stat Badges */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              gap: '14px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '19px', fontWeight: '600', color: '#FFD700' }}>
                🎓 6+
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: '#FCEBEE', textTransform: 'uppercase' }}>
                SOEC Programs
              </div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '14px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '19px', fontWeight: '600', color: '#FFD700' }}>
                🎯 2+
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: '#FCEBEE', textTransform: 'uppercase' }}>
                Project Tiers
              </div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '14px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '19px', fontWeight: '600', color: '#FFD700' }}>
                🤖 Gemini
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: '#FCEBEE', textTransform: 'uppercase' }}>
                AI Match Engine
              </div>
            </div>
          </div>
        </div>

        {/* LOGIN FORM PANEL (Right Side in Login Mode with Smooth Cross-Fade) */}
        <div
          style={{
            width: '54%',
            height: '100%',
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 5,
            padding: '28px 36px',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            transform: isRegister ? 'translateX(30px)' : 'translateX(0%)',
            opacity: isRegister ? 0 : 1,
            pointerEvents: isRegister ? 'none' : 'auto',
            transition: 'transform 0.55s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.35s ease-in-out',
          }}
        >
          {/* Header Branding */}
          <div style={{ marginBottom: '18px' }}>
            <img
              src={dbuuLogoBig}
              alt="Dev Bhoomi Uttarakhand University Crest Logo"
              style={{ height: '46px', objectFit: 'contain', marginBottom: '10px' }}
            />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '600', color: 'var(--ink, #1A1A1A)', margin: 0 }}>
              Welcome Back
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--ink-soft, #4A4A4A)', marginTop: '4px' }}>
              Sign in to your {portalName.toLowerCase()} workspace
            </p>
          </div>

          {loginError && (
            <div
              style={{
                background: 'rgba(196, 18, 48, 0.08)',
                border: '1px solid var(--pine, #C41230)',
                color: 'var(--pine, #C41230)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12.5px',
                marginBottom: '14px',
              }}
            >
              ⚠️ {loginError}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-soft)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Email Address or Admission No
              </label>
              <input
                type="text"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="name@gmail.com or 24BTCSE0123"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'var(--paper-2, #F1F1F1)',
                  border: '1px solid var(--paper-line, rgba(0,0,0,0.1))',
                  color: 'var(--ink)',
                  fontSize: '13.5px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-soft)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Password
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    borderRadius: '6px',
                    background: 'var(--paper-2, #F1F1F1)',
                    border: '1px solid var(--paper-line, rgba(0,0,0,0.1))',
                    color: 'var(--ink)',
                    fontSize: '13.5px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--ink-mute)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showLoginPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              style={{
                width: '100%',
                background: 'var(--slate, #16214A)',
                color: '#FFFFFF',
                border: 'none',
                padding: '11px 18px',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '4px',
                boxShadow: '0 4px 12px rgba(22, 33, 74, 0.25)',
              }}
            >
              {loginLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* REGISTER FORM PANEL (Left Side in Register Mode with Smooth Cross-Fade) */}
        <div
          style={{
            width: '54%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 5,
            padding: '24px 34px',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            transform: isRegister ? 'translateX(0%)' : 'translateX(-30px)',
            opacity: isRegister ? 1 : 0,
            pointerEvents: isRegister ? 'auto' : 'none',
            transition: 'transform 0.55s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.35s ease-in-out',
          }}
        >
          {/* Header Branding */}
          <div style={{ marginBottom: '14px' }}>
            <img
              src={dbuuLogoBig}
              alt="Dev Bhoomi Uttarakhand University Crest Logo"
              style={{ height: '40px', objectFit: 'contain', marginBottom: '8px' }}
            />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '600', color: 'var(--ink, #1A1A1A)', margin: 0 }}>
              Create Account
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--ink-soft, #4A4A4A)', marginTop: '2px' }}>
              Register for university capstone & team workspace access
            </p>
          </div>

          {regError && (
            <div
              style={{
                background: 'rgba(196, 18, 48, 0.08)',
                border: '1px solid var(--pine, #C41230)',
                color: 'var(--pine, #C41230)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                marginBottom: '10px',
              }}
            >
              ⚠️ {regError}
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Role Selection */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--ink-soft)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Registering As
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  style={{
                    padding: '7px',
                    borderRadius: '6px',
                    border: `2px solid ${role === 'student' ? 'var(--pine, #C41230)' : 'var(--paper-line)'}`,
                    background: role === 'student' ? 'rgba(196, 18, 48, 0.08)' : 'var(--paper-2)',
                    color: role === 'student' ? 'var(--pine, #C41230)' : 'var(--ink-soft)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('faculty')}
                  style={{
                    padding: '7px',
                    borderRadius: '6px',
                    border: `2px solid ${role === 'faculty' ? 'var(--slate, #16214A)' : 'var(--paper-line)'}`,
                    background: role === 'faculty' ? 'rgba(22, 33, 74, 0.08)' : 'var(--paper-2)',
                    color: role === 'faculty' ? 'var(--slate, #16214A)' : 'var(--ink-soft)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  👨‍🏫 Faculty
                </button>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--ink-soft)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Aman"
                style={{
                  width: '100%',
                  padding: '8px 11px',
                  borderRadius: '6px',
                  background: 'var(--paper-2, #F1F1F1)',
                  border: '1px solid var(--paper-line, rgba(0,0,0,0.1))',
                  color: 'var(--ink)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            {/* STUDENT ONLY: Admission No */}
            {role === 'student' && (
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--ink-soft)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Admission Number
                </label>
                <input
                  type="text"
                  required
                  value={regAdmissionNo}
                  onChange={(e) => setRegAdmissionNo(e.target.value.toUpperCase())}
                  placeholder="e.g. 24BTCSE0123"
                  style={{
                    width: '100%',
                    padding: '8px 11px',
                    borderRadius: '6px',
                    background: 'var(--paper-2, #F1F1F1)',
                    border: '1px solid var(--paper-line, rgba(0,0,0,0.1))',
                    color: 'var(--ink)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {/* Email Address */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--ink-soft)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="name@gmail.com"
                style={{
                  width: '100%',
                  padding: '8px 11px',
                  borderRadius: '6px',
                  background: 'var(--paper-2, #F1F1F1)',
                  border: '1px solid var(--paper-line, rgba(0,0,0,0.1))',
                  color: 'var(--ink)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--ink-soft)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Password
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '8px 38px 8px 11px',
                    borderRadius: '6px',
                    background: 'var(--paper-2, #F1F1F1)',
                    border: '1px solid var(--paper-line, rgba(0,0,0,0.1))',
                    color: 'var(--ink)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--ink-mute)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showRegPassword ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={regLoading}
              style={{
                width: '100%',
                background: 'var(--pine, #C41230)',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '4px',
                boxShadow: '0 4px 12px rgba(196, 18, 48, 0.25)',
              }}
            >
              {regLoading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
