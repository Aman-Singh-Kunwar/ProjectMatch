import React from 'react';
import { DBUU_PROJECT_SCHOOLS } from '../../data/schoolsData';

export default function ProjectSchools() {
  return (
    <section id="schools" style={{ padding: '56px 0', background: 'var(--paper-2)' }}>
      <div className="wrap">
        <div className="section-head" style={{ marginBottom: '32px' }}>
          <p className="eyebrow">Project-Bearing DBUU Schools</p>
          <h2 className="section-title">2nd, 3rd & 4th Year Minor/Major Project Schools</h2>
          <p className="section-sub">Listed below are the DBUU Schools with mandatory 2nd-year Minor Projects, 3rd-year Interdisciplinary Projects, and 4th-year Major Capstone Dissertations.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {DBUU_PROJECT_SCHOOLS.map((school) => (
            <div
              key={school.code}
              className="school-card reveal"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '2rem' }}>{school.icon}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--pine)', fontWeight: '600', background: 'rgba(196, 18, 48, 0.08)', padding: '4px 10px', borderRadius: '3px' }}>
                  {school.code}
                </span>
              </div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', fontWeight: '500', color: 'var(--ink)', marginBottom: '6px' }}>
                {school.name}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '10px', fontWeight: '500' }}>
                {school.degrees}
              </p>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--slate)', background: 'var(--paper-2)', padding: '6px 10px', borderRadius: '3px' }}>
                🎯 {school.projects}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
