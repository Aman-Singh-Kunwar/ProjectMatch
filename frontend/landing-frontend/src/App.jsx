import React, { useState, useEffect } from 'react';
import { dbuuLogo } from '@projectmatch/shared';

import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import AiSpecs from './components/Features/AiSpecs';
import ProjectSchools from './components/Schools/ProjectSchools';
import CampusStrip from './components/Campus/CampusStrip';
import RolePortals from './components/Portals/RolePortals';
import AuthModal from './components/Portals/AuthModal';
import TheRoute from './components/Route/TheRoute';
import Footer from './components/Footer/Footer';
import PwaStatus from './components/Pwa/PwaStatus';

import { useStatCounter } from './hooks/useStatCounter';
import { useScrollReveal } from './hooks/useScrollReveal';

const PORTALS = {
  STUDENT: import.meta.env.VITE_STUDENT_PORTAL_URL || 'http://localhost:5173',
  FACULTY: import.meta.env.VITE_FACULTY_PORTAL_URL || 'http://localhost:5174',
  ADMIN: import.meta.env.VITE_ADMIN_PORTAL_URL || 'http://localhost:5000/api',
  API_BASE: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
};

export default function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [selectedRole, setSelectedRole] = useState('student');
  const [selectedSchool, setSelectedSchool] = useState('SOEC');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const openAuth = (role, mode = 'login') => {
    setSelectedRole(role);
    setAuthMode(mode);
    setAuthError('');
    setFormData({ name: '', email: '', password: '' });
    setShowLoginModal(true);
  };

  const handleDirectAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setSubmitting(true);

    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const payload = authMode === 'login'
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password, role: selectedRole, school: selectedSchool };

      const res = await fetch(`${PORTALS.API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.user.role !== selectedRole) {
        throw new Error(`Your account is registered as '${data.user.role}', not '${selectedRole}'.`);
      }

      let targetPortalUrl = PORTALS.STUDENT;
      if (selectedRole === 'faculty') targetPortalUrl = PORTALS.FACULTY;
      if (selectedRole === 'admin') targetPortalUrl = PORTALS.ADMIN;

      window.location.href = `${targetPortalUrl}?token=${data.token}`;
    } catch (err) {
      setAuthError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Header />
      <Hero />
      <AiSpecs />
      <ProjectSchools />
      <CampusStrip />
      <RolePortals PORTALS={PORTALS} openAuth={openAuth} />
      <TheRoute />
      <Footer PORTALS={PORTALS} />

      <AuthModal
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        authMode={authMode}
        setAuthMode={setAuthMode}
        selectedRole={selectedRole}
        selectedSchool={selectedSchool}
        setSelectedSchool={setSelectedSchool}
        formData={formData}
        setFormData={setFormData}
        authError={authError}
        submitting={submitting}
        handleDirectAuth={handleDirectAuth}
      />

      {/* PWA Service Worker & Offline Status Monitor */}
      <PwaStatus />
    </div>
  );
}
