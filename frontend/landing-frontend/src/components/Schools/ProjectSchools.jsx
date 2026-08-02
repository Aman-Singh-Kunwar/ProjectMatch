import React from 'react';
import { DBUU_SOEC_PROGRAMS } from '../../data/schoolsData';

export default function ProjectSchools() {
  return (
    <section id="soec-programs" style={{ padding: '64px 0', background: 'var(--paper-2)' }}>
      <div className="wrap">
        <div className="section-head" style={{ marginBottom: '36px' }}>
          <p className="eyebrow">School of Engineering & Computing (SOEC)</p>
          <h2 className="section-title">6 Supported Undergraduate Degree Programs</h2>
          <p className="section-sub">
            ProjectMatch v1 locks scope to SOEC's 6 undergraduate engineering & application branches. Minor & Major capstone selection is dynamically filtered by your program duration and current academic year.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {DBUU_SOEC_PROGRAMS.map((prog) => (
            <div key={prog.code} className="school-card reveal">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '2rem' }}>{prog.icon}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--pine)', fontWeight: '600', background: 'rgba(196, 18, 48, 0.08)', padding: '4px 10px', borderRadius: '3px' }}>
                  {prog.code}
                </span>
              </div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '500', color: 'var(--ink)', marginBottom: '6px' }}>
                {prog.name}
              </h4>
              <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', marginBottom: '12px', fontWeight: '500' }}>
                {prog.duration}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--slate)', background: 'var(--paper-2)', padding: '5px 10px', borderRadius: '3px' }}>
                  🎯 {prog.minorYear}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--pine)', background: 'rgba(196, 18, 48, 0.06)', padding: '5px 10px', borderRadius: '3px' }}>
                  🏆 {prog.majorYear}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {prog.domainTags.map((tag, idx) => (
                  <span key={idx} style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--ink-soft)', background: 'var(--paper-2)', padding: '2px 7px', borderRadius: '3px' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
