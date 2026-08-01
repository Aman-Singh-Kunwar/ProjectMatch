import React from 'react';

export default function CampusStrip() {
  return (
    <>
      {/* DBUU CAMPUS & HERITAGE HIGHLIGHT STRIP */}
      <section id="campus" style={{ background: 'var(--slate)', color: '#FFFFFF', padding: '64px 0' }}>
        <div className="wrap">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', textAlign: 'center' }}>
            <div>
              <p className="stat-count-target" data-count="42" data-suffix="+" data-format="plain" style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: '600', color: 'var(--summit)' }}>0</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#C7CEDE', marginTop: '6px', textTransform: 'uppercase' }}>Lush Green Dehradun Campus (Acres)</p>
            </div>
            <div>
              <p className="stat-count-target" data-count="21" data-suffix="+" data-format="plain" style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: '600', color: 'var(--summit)' }}>0</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#C7CEDE', marginTop: '6px', textTransform: 'uppercase' }}>Academic Excellence (Years)</p>
            </div>
            <div>
              <p className="stat-count-target" data-count="120" data-suffix="+" data-format="plain" style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: '600', color: 'var(--summit)' }}>0</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#C7CEDE', marginTop: '6px', textTransform: 'uppercase' }}>Advanced R&D Facilities (Labs)</p>
            </div>
            <div>
              <p className="stat-count-target" data-count="15000" data-suffix="+" data-format="plain" style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: '600', color: 'var(--summit)' }}>0</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#C7CEDE', marginTop: '6px', textTransform: 'uppercase' }}>Alumni Network</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <div className="stats" id="stats">
        <div className="wrap stats-row">
          <div className="stat">
            <p className="stat-num stat-count-target" data-count="3" data-suffix="" data-format="plain">0</p>
            <p className="stat-label">Project Levels (2nd/3rd/4th Yr)</p>
          </div>
          <div className="stat">
            <p className="stat-num stat-count-target" data-count="6" data-suffix="" data-format="plain">0</p>
            <p className="stat-label">Project-Bearing Schools</p>
          </div>
          <div className="stat">
            <p className="stat-num stat-count-target" data-count="1" data-suffix=":1" data-format="ratio">0</p>
            <p className="stat-label">Faculty Mentor Ratio</p>
          </div>
          <div className="stat">
            <p className="stat-num stat-count-target" data-count="0" data-suffix="" data-format="plain">0</p>
            <p className="stat-label">Paper Forms Required</p>
          </div>
        </div>
      </div>
    </>
  );
}
