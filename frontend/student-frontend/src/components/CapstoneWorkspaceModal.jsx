import React, { useState } from 'react';

export default function CapstoneWorkspaceModal({ isOpen, onClose, team, user }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'milestones', 'roster', 'resources'
  const [repoUrl, setRepoUrl] = useState('https://github.com/dbuu-soec/capstone-team-workspace');
  const [docsUrl, setDocsUrl] = useState('https://docs.google.com/document/d/dbuu-srs-spec');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Interactive Milestones State
  const [milestones, setMilestones] = useState([
    { id: 1, title: 'Capstone Proposal & Mentor Allocation', dueDate: 'Term Wk 2', done: true, tag: 'Phase 1' },
    { id: 2, title: 'System Requirement Spec (SRS) & Architecture Diagram', dueDate: 'Term Wk 4', done: true, tag: 'Phase 1' },
    { id: 3, title: 'Mid-Term Prototype Demonstration & Code Audit', dueDate: 'Term Wk 8', done: false, tag: 'Phase 2' },
    { id: 4, title: 'Final Capstone Defense & Project Presentation', dueDate: 'Term Wk 14', done: false, tag: 'Phase 3' },
  ]);

  if (!isOpen || !team) return null;

  const project = team.project;
  const mentor = team.mentor || project?.requestedMentor;
  const members = team.members || [];

  const toggleMilestone = (id) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, done: !m.done } : m));
  };

  const handleSaveResources = (e) => {
    e.preventDefault();
    setSaveSuccess('Resource links saved successfully for team workspace!');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 15, 36, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '1000px',
          maxWidth: '96vw',
          height: '680px',
          maxHeight: '92vh',
          background: 'var(--surface, #FFFFFF)',
          borderRadius: '16px',
          border: '1px solid var(--paper-line, rgba(0,0,0,0.1))',
          boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Workspace Top Navigation Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0A0F24 0%, #16214A 100%)',
            color: '#FFFFFF',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span
                style={{
                  background: 'var(--success, #10B981)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: '700',
                  padding: '3px 9px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                }}
              >
                ✓ APPROVED WORKSPACE
              </span>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'var(--font-mono)' }}>
                SOEC Capstone Team #{team._id?.substring(18) || '01'}
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display, Georgia)', fontSize: '22px', fontWeight: '600', margin: 0, color: '#FFFFFF' }}>
              {project?.title || 'Capstone Project Workspace'}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--paper-line, rgba(0,0,0,0.1))',
            background: 'var(--paper-2, #F8F9FA)',
            padding: '0 28px',
          }}
        >
          {[
            { id: 'overview', label: '📌 Overview & Mentor' },
            { id: 'milestones', label: '🎯 Deliverables & Milestones' },
            { id: 'roster', label: '👥 Team Roster' },
            { id: 'resources', label: '🔗 Code & Repository Links' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 20px',
                fontFamily: 'var(--font-body)',
                fontSize: '13.5px',
                fontWeight: activeTab === tab.id ? '600' : '500',
                color: activeTab === tab.id ? 'var(--pine, #C41230)' : 'var(--ink-soft, #4A4A4A)',
                borderBottom: activeTab === tab.id ? '3px solid var(--pine, #C41230)' : '3px solid transparent',
                background: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body Area */}
        <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '8px', color: 'var(--ink)' }}>
                  Project Abstract & Scope
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: '1.6', marginBottom: '20px' }}>
                  {project?.description || 'No description available for this capstone.'}
                </p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  <span className="idea-tag" style={{ background: 'var(--paper-2)', padding: '5px 12px' }}>
                    Tier: {project?.targetLevel?.toUpperCase()}
                  </span>
                  <span className="idea-tag" style={{ background: 'var(--paper-2)', padding: '5px 12px' }}>
                    Source: {project?.source === 'faculty_pool' ? 'Faculty Pool' : 'Student Proposed'}
                  </span>
                  {project?.domainTags?.map((t, idx) => (
                    <span key={idx} className="idea-tag" style={{ background: 'var(--paper-2)', padding: '5px 12px' }}>
                      {t}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid var(--success, #10B981)',
                    borderRadius: '10px',
                    padding: '16px 20px',
                  }}
                >
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--success)', marginBottom: '4px' }}>
                    🎓 DBUU SOEC Department Verification Stamp
                  </h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)' }}>
                    Verified by Department Admin. Official capstone credits allocated for Minor/Major degree completion.
                  </p>
                </div>
              </div>

              {/* Mentor Info Sidebar Card */}
              <div
                style={{
                  background: 'var(--paper-2, #F8F9FA)',
                  border: '1px solid var(--paper-line, rgba(0,0,0,0.1))',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--pine)', fontWeight: '600' }}>
                  ASSIGNED FACULTY MENTOR
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'var(--slate, #16214A)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-display)',
                      fontWeight: '600',
                      fontSize: '16px',
                    }}
                  >
                    {mentor?.name ? mentor.name.substring(0, 2).toUpperCase() : 'FM'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: 'var(--ink)' }}>
                      Prof. {mentor?.name || 'Assigned Faculty'}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)' }}>
                      {mentor?.email || 'faculty@dbuu.ac.in'}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--paper-line)', paddingTop: '12px', marginTop: '12px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginBottom: '6px' }}>
                    💬 <strong>Office Hours:</strong> Tuesdays & Thursdays, 2:00 PM – 4:00 PM (SOEC Lab 3)
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                    📌 <strong>Evaluation Criteria:</strong> Code Quality, Mid-term Demo, SRS Documentation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MILESTONES */}
          {activeTab === 'milestones' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--ink)', margin: 0 }}>
                    Capstone Milestone Schedule
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0 }}>
                    Track deliverables required for semester evaluations
                  </p>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--pine)', fontWeight: '600' }}>
                  {milestones.filter(m => m.done).length} / {milestones.length} Completed
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => toggleMilestone(m.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      background: m.done ? 'rgba(16, 185, 129, 0.06)' : 'var(--paper-2)',
                      border: `1px solid ${m.done ? 'var(--success, #10B981)' : 'var(--paper-line)'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <input
                        type="checkbox"
                        checked={m.done}
                        onChange={() => {}}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <div>
                        <h4
                          style={{
                            fontSize: '14.5px',
                            fontWeight: '600',
                            margin: 0,
                            color: m.done ? 'var(--ink-soft)' : 'var(--ink)',
                            textDecoration: m.done ? 'line-through' : 'none',
                          }}
                        >
                          {m.title}
                        </h4>
                        <span style={{ fontSize: '11.5px', color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
                          Target Deadline: {m.dueDate}
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        background: m.done ? 'var(--success)' : 'var(--slate)',
                        color: '#FFFFFF',
                        fontWeight: '600',
                      }}
                    >
                      {m.done ? 'COMPLETED' : m.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ROSTER */}
          {activeTab === 'roster' && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '16px', color: 'var(--ink)' }}>
                Team Members ({members.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {members.map((m, idx) => (
                  <div
                    key={m._id || idx}
                    style={{
                      background: 'var(--paper-2)',
                      border: '1px solid var(--paper-line)',
                      borderRadius: '12px',
                      padding: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: idx === 0 ? 'var(--pine, #C41230)' : 'var(--slate, #16214A)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '15px',
                      }}
                    >
                      {m.name ? m.name.substring(0, 2).toUpperCase() : 'ST'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14.5px', fontWeight: '600', margin: 0, color: 'var(--ink)' }}>
                        {m.name} {m._id === user?._id ? '(You)' : ''}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)', margin: 0 }}>
                        {m.email}
                      </p>
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: '4px',
                          fontSize: '10.5px',
                          fontFamily: 'var(--font-mono)',
                          color: idx === 0 ? 'var(--pine)' : 'var(--ink-mute)',
                          fontWeight: '600',
                        }}
                      >
                        {idx === 0 ? '👑 Team Leader' : '💻 Developer / Member'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RESOURCES */}
          {activeTab === 'resources' && (
            <div style={{ maxWidth: '640px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '8px', color: 'var(--ink)' }}>
                Team Deliverable Links
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', marginBottom: '20px' }}>
                Store source code repositories and Google Drive design documents for faculty evaluations.
              </p>

              {saveSuccess && (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid var(--success)',
                    color: 'var(--success)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px',
                  }}
                >
                  ✓ {saveSuccess}
                </div>
              )}

              <form onSubmit={handleSaveResources} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--ink-soft)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    GitHub / GitLab Repository URL
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      background: 'var(--paper-2)',
                      border: '1px solid var(--paper-line)',
                      fontSize: '13.5px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--ink-soft)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    SRS / Documentation Drive Link
                  </label>
                  <input
                    type="url"
                    value={docsUrl}
                    onChange={(e) => setDocsUrl(e.target.value)}
                    placeholder="https://docs.google.com/document/d/..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      background: 'var(--paper-2)',
                      border: '1px solid var(--paper-line)',
                      fontSize: '13.5px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-select"
                  style={{
                    padding: '11px 20px',
                    borderRadius: '6px',
                    fontSize: '13.5px',
                    alignSelf: 'flex-start',
                    marginTop: '6px',
                  }}
                >
                  Save Workspace Links
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
