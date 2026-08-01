import React, { useState, useEffect } from 'react';

export default function PwaStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Register Service Worker for PWA Offline Caching
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (reg) => {
            console.log('ProjectMatch PWA ServiceWorker registered with scope:', reg.scope);
          },
          (err) => {
            console.log('ProjectMatch PWA ServiceWorker registration failed:', err);
          }
        );
      });
    }

    // Monitor Network Online / Offline Status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for PWA BeforeInstallPrompt Event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
        }
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      });
    }
  };

  return (
    <>
      {/* OFFLINE STATUS NOTIFICATION BANNER */}
      {isOffline && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--slate)',
            color: '#FFFFFF',
            border: '1px solid var(--summit)',
            borderRadius: 'var(--radius)',
            padding: '10px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12.5px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E53935' }} />
          📶 Offline Mode &mdash; Displaying cached DBUU guidelines & school details.
        </div>
      )}

      {/* PWA INSTALL PROMPT BAR */}
      {showInstallBanner && !isOffline && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'var(--surface)',
            border: '1px solid var(--paper-line)',
            borderLeft: '4px solid var(--pine)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 18px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 998,
            maxWidth: '320px',
          }}
        >
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '500', marginBottom: '4px' }}>
            Install ProjectMatch DBUU
          </p>
          <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginBottom: '10px' }}>
            Install to home screen for instant offline access to DBUU capstone rules.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleInstallClick}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '11.5px' }}
            >
              Install App
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--ink-mute)', cursor: 'pointer' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}
