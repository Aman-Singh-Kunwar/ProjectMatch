import React from 'react';

export default function Hero() {
  return (
    <section className="hero" id="home">
      <svg className="hero-topo" viewBox="0 0 1180 480" preserveAspectRatio="none" aria-hidden="true">
        <path className="topo-path topo-path-1" d="M-20,100 C 200,50 400,150 620,90 S 1000,30 1200,80" fill="none" stroke="#C41230" strokeWidth="1" opacity="0.10" />
        <path className="topo-path topo-path-2" d="M-20,160 C 220,120 420,210 640,150 S 1000,90 1200,140" fill="none" stroke="#16214A" strokeWidth="1" opacity="0.08" />
        <path className="topo-path topo-path-3" d="M-20,220 C 240,190 440,270 660,210 S 1000,150 1200,200" fill="none" stroke="#C41230" strokeWidth="1" opacity="0.07" />
      </svg>
      <div className="wrap hero-inner">
        <p className="eyebrow hero-eyebrow">
          Dev Bhoomi Uttarakhand University &mdash; <strong>School of Engineering & Computing (SOEC)</strong>
        </p>
        <h1 className="hero-title">
          Chart your Minor & Major capstone, <em>waypoint by waypoint.</em>
        </h1>
        <p className="hero-sub">
          One central platform for B.Tech (Yr 3 Minor / Yr 4 Major) and BCA (Yr 2 Minor / Yr 3 Major) capstone cycles. Connect faculty pool ideas with student technical skills via Gemini 768-D AI vector matching.
        </p>
        <div className="hero-actions">
          <a href="#portals" className="btn-primary">LAUNCH PORTAL SSO &rarr;</a>
          <a href="#features" className="btn-text">How Gemini Matching Works</a>
        </div>

        <div className="waypoints">
          <div className="waypoint-row">
            <div className="waypoint"><p className="wp-num">01</p><p className="wp-label">Pick Minor / Major Idea</p></div>
            <div className="waypoint"><p className="wp-num">02</p><p className="wp-label">Rope in Teammates</p></div>
            <div className="waypoint"><p className="wp-num">03</p><p className="wp-label">Faculty Mentor Sign-Off</p></div>
            <div className="waypoint"><p className="wp-num">04</p><p className="wp-label">Team Workspace Base Camp</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
