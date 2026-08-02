import React from 'react';
import { dbuuLogo } from '@projectmatch/shared';

export default function Header() {
  return (
    <>
      <header className="header-top" id="home">
        {/* Tier 1: Utility Bar */}
        <div className="nav-utility">
          <div className="wrap nav-utility-inner">
            <div className="nav-utility-links">
              <a href="https://www.dbuu.ac.in/" target="_blank" rel="noreferrer">DBUU Official Site</a>
              <a href="#portals">Role Portals</a>
              <a href="#soec-programs">SOEC Programs</a>
              <a href="#ai-matching">AI Skill Matching</a>
              <a href="#contact">Toll Free: 1800 103 4049</a>
            </div>
            <p className="nav-utility-status">
              <span className="dot" aria-hidden="true"></span>
              Project Window Open &mdash; Closes Aug 20
            </p>
          </div>
        </div>

        {/* Tier 2: DBUU Main Brand Bar */}
        <div className="nav-main">
          <div className="wrap nav-main-inner">
            <div className="nav-brand">
              <img
                src={dbuuLogo}
                alt="Dev Bhoomi Uttarakhand University Logo"
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--pine)',
                  background: '#fff',
                }}
              />
              <div className="nav-brand-text">
                <p>ProjectMatch</p>
                <p>Dev Bhoomi Uttarakhand University, Dehradun</p>
              </div>
            </div>
            <div className="nav-quick">
              <div className="nav-quick-box">
                <strong>Minor & Major</strong>&nbsp;Project Portal
              </div>
              <a href="#portals" className="btn-primary">ENTER PORTAL &rarr;</a>
            </div>
          </div>
        </div>
      </header>

      {/* Tier 3: Crimson Red Nav Links Bar — Order: Home -> Role Portals -> SOEC Programs -> AI Specs -> How it works -> DBUU Campus */}
      <nav className="nav-links-bar">
        <div className="wrap nav-links-bar-inner">
          <a href="#home">Home</a>
          <a href="#portals">Role Portals</a>
          <a href="#soec-programs">SOEC Programs (2nd/3rd/4th Yr)</a>
          <a href="#ai-matching">AI Matching Specs</a>
          <a href="#how-it-works">How it works</a>
          <a href="#campus-stats">DBUU Campus</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>
    </>
  );
}
