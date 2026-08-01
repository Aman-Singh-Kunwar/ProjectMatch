import React from 'react';
import { dbuuLogo } from '@projectmatch/shared';

export default function Header() {
  return (
    <header>
      {/* Tier 1: Utility Bar */}
      <div className="nav-utility">
        <div className="wrap nav-utility-inner">
          <div className="nav-utility-links">
            <a href="https://www.dbuu.ac.in/" target="_blank" rel="noreferrer">DBUU Official Site</a>
            <a href="#schools">Eligible Schools</a>
            <a href="#features">AI Skill Matching</a>
            <a href="#portals">Student Corner</a>
            <a href="#portals">Faculty Corner</a>
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

      {/* Tier 3: Crimson Red Nav Links Bar */}
      <div className="nav-links-bar">
        <div className="wrap nav-links-bar-inner">
          <a href="#home">Home</a>
          <a href="#features">AI Matching Specs</a>
          <a href="#schools">Project Schools (2nd/3rd/4th Yr)</a>
          <a href="#route">How it works</a>
          <a href="#portals">Role Portals</a>
          <a href="#campus">DBUU Campus</a>
          <a href="#contact">Contact</a>
        </div>
      </div>
    </header>
  );
}
