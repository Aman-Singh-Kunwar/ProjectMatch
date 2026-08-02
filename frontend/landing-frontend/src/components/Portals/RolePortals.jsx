import React from 'react';

export default function RolePortals({ PORTALS, openAuth }) {
  return (
    <section id="portals">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">Unified DBUU Access</p>
          <h2 className="section-title">Every role gets its own trailhead.</h2>
          <p className="section-sub">Role-isolated portals for DBUU Students (SOEC 2nd/3rd/4th Yr), Faculty Mentors, and Department Admin Officers.</p>
        </div>

        <div className="signposts">
          {/* Student Signpost */}
          <div className="signpost student reveal">
            <div className="signpost-content">
              <p className="signpost-role">Student (SOEC Programs)</p>
              <h3>Find Minor / Major project</h3>
              <p>Browse faculty-listed topics matching your skills, or propose your custom research topic and invite your team members across DBUU.</p>
            </div>
            <div className="signpost-actions">
              <a href={PORTALS.STUDENT} className="signpost-enter">
                Enter student portal &rarr;
              </a>
              <button
                onClick={() => openAuth('student', 'login')}
                className="signpost-direct-btn student"
              >
                Direct Sign In
              </button>
            </div>
          </div>

          {/* Faculty Signpost */}
          <div className="signpost faculty reveal">
            <div className="signpost-content">
              <p className="signpost-role">Faculty Mentor</p>
              <h3>List & guide capstones</h3>
              <p>Publish Minor & Major project topics, review incoming mentorship requests, set milestone targets, and hold review meetings.</p>
            </div>
            <div className="signpost-actions">
              <a href={PORTALS.FACULTY} className="signpost-enter">
                Enter faculty portal &rarr;
              </a>
              <button
                onClick={() => openAuth('faculty', 'login')}
                className="signpost-direct-btn faculty"
              >
                Direct Sign In
              </button>
            </div>
          </div>

          {/* Admin Signpost */}
          <div className="signpost admin reveal">
            <div className="signpost-content">
              <p className="signpost-role">SOEC Dept Admin</p>
              <h3>Departmental oversight</h3>
              <p>Review submitted teams, manage the project formation window, approve capstones, and assign unallocated students before deadlines.</p>
            </div>
            <div className="signpost-actions">
              <a href={PORTALS.ADMIN} className="signpost-enter">
                Enter admin portal &rarr;
              </a>
              <button
                onClick={() => openAuth('admin', 'login')}
                className="signpost-direct-btn admin"
              >
                Direct Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
