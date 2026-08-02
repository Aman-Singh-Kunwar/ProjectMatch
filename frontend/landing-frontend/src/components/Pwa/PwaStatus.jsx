import React, { useState, useEffect } from 'react';

export default function PwaStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    // 1. PROD vs DEV Guard: Register SW only in production builds
    if ('serviceWorker' in navigator) {
      if (import.meta.env.PROD) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').then(
            (reg) => {
              // 2. Lifecycle Update Detection
              if (reg.waiting) {
                setUpdateAvailable(true);
                setWaitingWorker(reg.waiting);
              }

              reg.onupdatefound = () => {
                const installingWorker = reg.installing;
                if (installingWorker) {
                  installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                      setUpdateAvailable(true);
                      setWaitingWorker(installingWorker);
                    }
                  };
                }
              };
            },
            (err) => {
              console.log('ProjectMatch PWA ServiceWorker registration failed:', err);
            }
          );
        });
      } else {
        // In DEV mode: automatically unregister any active service workers
        // to prevent cache staleness while running 'npm run dev'
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
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

  const handleRefreshApp = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  return (
    <>
      {/* UPDATE AVAILABLE BANNER */}
      {updateAvailable && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--pine)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius)',
            padding: '10px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12.5px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span>🚀 New DBUU ProjectMatch update available!</span>
          <button
            onClick={handleRefreshApp}
            style={{
              background: '#FFFFFF',
              color: 'var(--pine)',
              border: 'none',
              borderRadius: '3px',
              padding: '4px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Refresh Now
          </button>
        </div>
      )}

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
      {showInstallBanner && !isOffline && !updateAvailable && (
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
