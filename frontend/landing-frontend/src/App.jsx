import React, { useState, useEffect } from 'react';
import { dbuuLogo } from '@projectmatch/shared';

import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import RolePortals from './components/Portals/RolePortals';
import ProjectSchools from './components/Schools/ProjectSchools';
import CampusStrip from './components/Campus/CampusStrip';
import AiSpecs from './components/Features/AiSpecs';
import TheRoute from './components/Route/TheRoute';
import Footer from './components/Footer/Footer';
import AuthModal from './components/Portals/AuthModal';
import PwaStatus from './components/Pwa/PwaStatus';

import { useStatCounter } from './hooks/useStatCounter';
import { useScrollReveal } from './hooks/useScrollReveal';

const PORTALS = {
  STUDENT: import.meta.env.VITE_STUDENT_PORTAL_URL || 'http://localhost:5173',
  FACULTY: import.meta.env.VITE_FACULTY_PORTAL_URL || 'http://localhost:5174',
  ADMIN: import.meta.env.VITE_ADMIN_PORTAL_URL || 'http://localhost:5175',
};

export default function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [authInitialRole, setAuthInitialRole] = useState('student');

  // Initialize custom hooks for IntersectionObserver animations
  useStatCounter();
  useScrollReveal();

  useEffect(() => {
    document.title = "ProjectMatch — Dev Bhoomi Uttarakhand University";
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = dbuuLogo;
  }, []);

  const openAuth = (role = 'student', mode = 'login') => {
    setAuthInitialRole(role);
    setAuthInitialMode(mode);
    setShowLoginModal(true);
  };

  return (
    <div>
      <Header />
      {/* 1. Home */}
      <Hero />

      {/* 2. Role Portals */}
      <RolePortals PORTALS={PORTALS} openAuth={openAuth} />

      {/* 3. SOEC Programs (2nd/3rd/4th Yr) */}
      <ProjectSchools />

      {/* 4. DBUU Campus */}
      <CampusStrip />

      {/* 5. AI Matching Specs */}
      <AiSpecs />

      {/* 6. How it works */}
      <TheRoute />

      <Footer PORTALS={PORTALS} />

      <AuthModal
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        initialMode={authInitialMode}
        initialRole={authInitialRole}
      />

      {/* PWA Service Worker & Offline Status Monitor */}
      <PwaStatus />
    </div>
  );
}
