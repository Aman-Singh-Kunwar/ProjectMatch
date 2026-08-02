import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  AuthProvider,
  useAuth,
  catchSSOToken,
  redirectToPortal,
  LoginForm,
  RegisterForm,
  SplitAuthPage,
  dbuuLogo,
} from '@projectmatch/shared';
import {
  useMyTeam,
  useRecommendedProjects,
  useFacultyList,
  useCreateTeam,
  useAddTeamMember,
  useSubmitTeam,
  useProposeIdea,
} from './hooks/useStudentDashboard';
import JourneyTracker from './components/JourneyTracker';

// Lazily load heavy workspace modal component
const CapstoneWorkspaceModal = lazy(() => import('./components/CapstoneWorkspaceModal'));

function StudentMainApp() {
  const { user, logout } = useAuth();
  const { team, setTeam, loading: teamLoading, refetch: refetchTeam } = useMyTeam();
  const {
    recommendations,
    eligibleLevel,
    reason,
    loading: recsLoading,
    refetch: refetchRecs,
  } = useRecommendedProjects();
  const { facultyList } = useFacultyList();

  const createTeamAction = useCreateTeam();
  const addMemberAction = useAddTeamMember();
  const submitTeamAction = useSubmitTeam();
  const proposeIdeaAction = useProposeIdea();

  // Form & Modal states
  const [proposeOpen, setProposeOpen] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDesc, setProposalDesc] = useState('');
  const [proposalMentor, setProposalMentor] = useState('');
  const [teammateEmail, setTeammateEmail] = useState('');
  const [actionError, setActionError] = useState('');
  const [selectedIdeaDetail, setSelectedIdeaDetail] = useState(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  // Sync meaningful URL in browser address bar
  useEffect(() => {
    if (workspaceOpen) {
      window.history.pushState(null, '', '/team-workspace');
    } else {
      window.history.replaceState(null, '', '/dashboard');
    }
  }, [workspaceOpen]);

  // Handle Idea Selection from Pool
  const handleSelectIdea = async (projectId) => {
    setActionError('');
    try {
      const updatedTeam = await createTeamAction.execute(projectId);
      setTeam(updatedTeam);
      refetchRecs();
    } catch (err) {
      setActionError(err.message || 'Failed to select project idea.');
    }
  };

  // Handle Propose Custom Idea
  const handleProposeSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    if (!proposalTitle || !proposalDesc) {
      setActionError('Please fill out both project title and description.');
      return;
    }
    try {
      const createdProject = await proposeIdeaAction.execute({
        title: proposalTitle,
        description: proposalDesc,
        requestedMentor: proposalMentor || null,
      });
      // Lock student team into this newly created project
      const updatedTeam = await createTeamAction.execute(createdProject._id);
      setTeam(updatedTeam);
      setProposeOpen(false);
      setProposalTitle('');
      setProposalDesc('');
    } catch (err) {
      setActionError(err.message || 'Failed to propose custom idea.');
    }
  };

  // Handle Add Teammate
  const handleAddMember = async (e) => {
    e.preventDefault();
    setActionError('');
    if (!teammateEmail) return;
    if (!team) {
      setActionError('Please select a project idea first to form a team.');
      return;
    }
    try {
      const updatedTeam = await addMemberAction.execute(team._id, teammateEmail);
      setTeam(updatedTeam);
      setTeammateEmail('');
    } catch (err) {
      setActionError(err.message || 'Failed to add teammate.');
    }
  };

  // Handle Submit Team
  const handleSubmitTeamForApproval = async () => {
    setActionError('');
    if (!team) return;
    try {
      const updatedTeam = await submitTeamAction.execute(team._id);
      setTeam(updatedTeam);
    } catch (err) {
      setActionError(err.message || 'Failed to submit team.');
    }
  };

  // Compute User Initials
  const getInitials = (name) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (teamLoading || recsLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--paper-2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
        color: 'var(--slate)',
      }}>
        ⚡ Loading DBUU Student Workspace & Team Session...
      </div>
    );
  }

  // Derive Team & Submission Validation States
  const teamStatus = team ? team.status : null;
  const project = team ? team.project : null;
  const members = team ? team.members : [];
  const mentor = team ? team.mentor : null;

  // Specific Submit Disable Reasons
  let submitDisabledReason = '';
  let canSubmit = true;

  if (!project) {
    canSubmit = false;
    submitDisabledReason = 'Select an idea from the list to lock in your project.';
  } else if (project.source === 'student_proposed' && project.mentorStatus !== 'mentor_accepted') {
    canSubmit = false;
    const requestedMentorName = project.requestedMentor?.name || 'faculty mentor';
    submitDisabledReason = `Waiting for requested mentor (${requestedMentorName}) to accept your proposal before submission.`;
  } else if (members.length < 2) {
    canSubmit = false;
    submitDisabledReason = 'Add at least 1 teammate to form a team before submitting.';
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)', color: 'var(--ink)' }}>
      {/* Brand App Bar */}
      <div className="appbar">
        <div className="wrap appbar-inner">
          <div className="appbar-brand">
            <img
              src={dbuuLogo}
              alt="DBUU Logo"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--pine)',
              }}
            />
            <span>ProjectMatch</span>
            <span className="appbar-role">STUDENT &bull; SOEC</span>
          </div>
          <div className="appbar-user">
            <div className="appbar-avatar">{getInitials(user?.name)}</div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{user?.name}</span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)' }}>
                {user?.program?.code || 'B.Tech'} (Yr {user?.currentYear})
              </span>
            </div>
            <button className="appbar-logout" onClick={logout}>
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Journey Tracker */}
      <JourneyTracker team={team} />

      {/* Dashboard Main Content */}
      <div className="dash">
        <div className="wrap">
          {/* Header Greeting */}
          <div className="dash-head">
            <h1 className="dash-title">Welcome back, {user?.name?.split(' ')[0] || 'Student'}.</h1>
            <p className="dash-sub">
              {user?.program?.name || 'School of Engineering & Computing (SOEC)'} &bull; Year {user?.currentYear} &bull;{' '}
              {eligibleLevel ? (
                <strong style={{ color: 'var(--pine)' }}>Eligible for {eligibleLevel.toUpperCase()} Project</strong>
              ) : (
                <span style={{ color: 'var(--clay)' }}>Not currently in a project selection year</span>
              )}
            </p>
          </div>

          {/* Action/Global Error Alert */}
          {actionError && (
            <div style={{
              background: 'rgba(196, 18, 48, 0.08)',
              border: '1px solid var(--pine)',
              color: 'var(--pine)',
              padding: '12px 18px',
              borderRadius: 'var(--radius)',
              marginBottom: '20px',
              fontSize: '13.5px',
              fontFamily: 'var(--font-body)',
            }}>
              ⚠️ {actionError}
            </div>
          )}

          {/* REJECTED ALERT (STATE C) */}
          {teamStatus === 'rejected' && (
            <div style={{
              background: 'rgba(196, 18, 48, 0.08)',
              border: '2px solid var(--pine)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 24px',
              marginBottom: '24px',
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--pine)', fontSize: '18px', marginBottom: '6px' }}>
                ⚠️ Team Submission Returned (Needs Revision)
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '8px' }}>
                <strong>Rejection Note from Admin:</strong> {team.rejectionNote || 'Please update your team members or choose a different idea.'}
              </p>
              <p style={{ fontSize: '12.5px', color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
                Your team has returned to "Forming" state. Make necessary edits below and resubmit for approval.
              </p>
            </div>
          )}

          {/* STATE B & D: READ-ONLY LOCKED VIEWS FOR PENDING APPROVAL AND APPROVED TEAMS */}
          {(teamStatus === 'pending_admin_approval' || teamStatus === 'approved') ? (
            <div className="dash-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card">
                  <div className="card-head">
                    <h2>
                      {teamStatus === 'approved' ? '🎉 Approved Capstone Workspace' : '⌛ Pending Department Approval'}
                    </h2>
                    <span className={`status-pill ${teamStatus}`}>
                      {teamStatus === 'approved' ? 'APPROVED' : 'PENDING APPROVAL'}
                    </span>
                  </div>
                  <div className="card-body">
                    <div style={{
                      background: teamStatus === 'approved' ? 'var(--success-tint)' : 'var(--pine-tint)',
                      border: `1px solid ${teamStatus === 'approved' ? 'var(--success)' : 'var(--pine)'}`,
                      borderRadius: 'var(--radius)',
                      padding: '16px 20px',
                      marginBottom: '20px',
                    }}>
                      {teamStatus === 'approved' ? (
                        <p style={{ color: 'var(--success)', fontWeight: '600', fontSize: '14.5px' }}>
                          🎉 Congratulations! Your team and project have been officially approved by the SOEC Admin. You are now assigned to Prof. {mentor?.name || project?.createdBy?.name || 'Mentor'}.
                        </p>
                      ) : (
                        <p style={{ color: 'var(--pine)', fontWeight: '500', fontSize: '14px' }}>
                          ⌛ Your team submission is currently under review by the School of Engineering & Computing (SOEC) Admin. Team roster and project idea are locked.
                        </p>
                      )}
                    </div>

                    <div style={{ border: '1px solid var(--paper-line)', borderRadius: 'var(--radius)', padding: '20px', background: 'var(--paper-2)' }}>
                      <span className="eyebrow" style={{ color: 'var(--pine)' }}>LOCKED PROJECT IDEA</span>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginTop: '4px', marginBottom: '8px' }}>
                        {project?.title}
                      </h3>
                      <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: '1.6', marginBottom: '14px' }}>
                        {project?.description}
                      </p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span className="idea-tag" style={{ background: 'var(--surface)' }}>Tier: {project?.targetLevel?.toUpperCase()}</span>
                        <span className="idea-tag" style={{ background: 'var(--surface)' }}>Source: {project?.source === 'faculty_pool' ? 'Faculty Pool' : 'Student Proposed'}</span>
                        {project?.domainTags?.map((tag, i) => (
                          <span key={i} className="idea-tag" style={{ background: 'var(--surface)' }}>{tag}</span>
                        ))}
                      </div>
                    </div>

                    {teamStatus === 'approved' && (
                      <div style={{ marginTop: '24px' }}>
                        <button
                          onClick={() => setWorkspaceOpen(true)}
                          className="btn-select"
                          style={{
                            width: '100%',
                            padding: '14px',
                            fontSize: '15px',
                            borderRadius: 'var(--radius)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 14px rgba(196, 18, 48, 0.25)',
                          }}
                        >
                          🚀 Enter Interactive Capstone Workspace &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Locked Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card">
                  <div className="card-head">
                    <h2 style={{ fontSize: '15px' }}>Team Roster</h2>
                    <span className="eyebrow">{members.length} Members</span>
                  </div>
                  <div className="card-body">
                    <div className="member-list">
                      {members.map((m) => (
                        <div key={m._id} className={`member ${m._id === user._id ? 'you' : ''}`}>
                          <span className="member-avatar">{getInitials(m.name)}</span>
                          <div>
                            <div style={{ fontWeight: '500' }}>
                              {m.name} {m._id === user._id ? '(you)' : ''}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
                              {m.email}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid var(--paper-line)', paddingTop: '14px', marginTop: '14px' }}>
                      <span className="eyebrow">Assigned Mentor</span>
                      <p style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--slate)', marginTop: '4px' }}>
                        {mentor ? `Prof. ${mentor.name}` : project?.requestedMentor ? `Prof. ${project.requestedMentor.name} (Pending)` : 'To be assigned by admin'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STATE A & C: BROWSING, FORMING, AND RESUBMISSION EDITABLE VIEW */
            <div className="dash-grid">
              {/* MAIN COLUMN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 1. NOT IN PROJECT YEAR STATE */}
                {reason === 'not_in_project_year' ? (
                  <div className="card">
                    <div className="card-body" style={{ padding: '36px 28px', textAlign: 'center' }}>
                      <div style={{ fontSize: '42px', marginBottom: '12px' }}>⏳</div>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--clay)', marginBottom: '8px' }}>
                        Project Allocation Selection Not Yet Open
                      </h2>
                      <p style={{ color: 'var(--ink-soft)', fontSize: '14.5px', maxWidth: '560px', margin: '0 auto 16px' }}>
                        You are currently in <strong>Year {user?.currentYear}</strong> of <strong>{user?.program?.name}</strong>. Project allocation opens in <strong>Year {user?.program?.minorYear} (Minor Project)</strong> and <strong>Year {user?.program?.majorYear} (Major Capstone)</strong>.
                      </p>
                      <span className="eyebrow" style={{ background: 'var(--paper-2)', padding: '6px 14px', borderRadius: 'var(--radius)' }}>
                        Check back when you reach Year {user?.program?.minorYear}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 2. RECOMMENDED IDEAS CARD */}
                    <div className="card">
                      <div className="card-head">
                        <h2>Recommended for you ({eligibleLevel?.toUpperCase()} Tier)</h2>
                        <span className="eyebrow">Ranked by Gemini AI match</span>
                      </div>
                      <div className="card-body">
                        {recsLoading ? (
                          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
                            ⚡ Computing vector similarity match scores...
                          </div>
                        ) : recommendations.length === 0 ? (
                          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ink-mute)' }}>
                            No pool ideas published for {eligibleLevel} project tier yet. Propose your own custom idea below!
                          </div>
                        ) : (
                          <div className="idea-list">
                            {recommendations.map(({ project: item, similarityScore }) => {
                              const isSelected = project && project._id === item._id;
                              const matchPercent = Math.round((similarityScore || 0.75) * 100);

                              return (
                                <div key={item._id} className="idea-card" style={{ borderColor: isSelected ? 'var(--pine)' : undefined, background: isSelected ? 'var(--pine-tint)' : undefined }}>
                                  <div className="idea-top">
                                    <div>
                                      <p className="idea-title">{item.title}</p>
                                      <p className="idea-meta">
                                        {item.createdBy?.name ? `Prof. ${item.createdBy.name}` : 'Faculty Member'} &bull; School of Engineering & Computing
                                      </p>
                                    </div>
                                    <span className="idea-match">✨ {matchPercent}% match</span>
                                  </div>
                                  <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: '8px 0', lineHeight: '1.5' }}>
                                    {item.description}
                                  </p>
                                  <div className="idea-tags">
                                    <span className="idea-tag">Tier: {item.targetLevel?.toUpperCase()}</span>
                                    {item.domainTags?.map((tag, idx) => (
                                      <span key={idx} className="idea-tag">{tag}</span>
                                    ))}
                                    <span className="idea-tag">Max size: {item.teamSizeMax || 4}</span>
                                  </div>
                                  <div className="idea-actions">
                                    <button
                                      disabled={isSelected || createTeamAction.loading}
                                      onClick={() => handleSelectIdea(item._id)}
                                      className="btn-sm btn-select"
                                      style={{ opacity: isSelected ? 0.7 : 1 }}
                                    >
                                      {isSelected ? '✓ Currently Selected' : 'Select this idea'}
                                    </button>
                                    <button
                                      className="btn-sm btn-ghost"
                                      onClick={() => setSelectedIdeaDetail(item)}
                                    >
                                      View details
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. PROPOSE OWN IDEA COLLAPSIBLE */}
                    <div className="card">
                      <div className="card-body">
                        <button
                          className="propose-toggle"
                          onClick={() => setProposeOpen(!proposeOpen)}
                        >
                          {proposeOpen ? '− Close custom proposal form' : '+ Don\'t see a fit? Propose your own idea instead →'}
                        </button>

                        <div className={`propose-form ${proposeOpen ? 'open' : ''}`}>
                          <form onSubmit={handleProposeSubmit}>
                            <div className="field">
                              <label>Project title</label>
                              <input
                                type="text"
                                required
                                value={proposalTitle}
                                onChange={(e) => setProposalTitle(e.target.value)}
                                placeholder="e.g. Crop Disease Detector via Computer Vision"
                              />
                            </div>
                            <div className="field">
                              <label>Short description & objectives</label>
                              <textarea
                                required
                                value={proposalDesc}
                                onChange={(e) => setProposalDesc(e.target.value)}
                                placeholder="What problem are you solving, what tech stack will you use, and why?"
                              ></textarea>
                            </div>
                            <div className="field">
                              <label>Request a DBUU Faculty Mentor</label>
                              <select
                                value={proposalMentor}
                                onChange={(e) => setProposalMentor(e.target.value)}
                              >
                                {facultyList.map((f) => (
                                  <option key={f._id} value={f._id}>
                                    Prof. {f.name} {f.skills?.length > 0 ? `(${f.skills.join(', ')})` : ''}
                                  </option>
                                ))}
                              </select>
                              <p className="field-hint">
                                Your mentor must accept this request before you can submit your team for admin approval.
                              </p>
                            </div>
                            <button
                              type="submit"
                              disabled={proposeIdeaAction.loading}
                              className="btn-sm btn-select"
                            >
                              {proposeIdeaAction.loading ? 'Submitting Proposal...' : 'Send mentor request & lock project'}
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* SIDEBAR — TEAM FORMING & SUBMIT CONTROL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card">
                  <div className="card-head">
                    <h2 style={{ fontSize: '15px' }}>Your team</h2>
                    <span className="status-pill forming">
                      {teamStatus === 'rejected' ? 'REVISED FORMING' : 'FORMING'}
                    </span>
                  </div>
                  <div className="card-body">
                    {/* Selected Project Box */}
                    {project ? (
                      <div style={{
                        background: 'var(--paper-2)',
                        border: '1px solid var(--paper-line)',
                        borderRadius: 'var(--radius)',
                        padding: '12px 14px',
                        marginBottom: '16px',
                      }}>
                        <span className="eyebrow" style={{ fontSize: '10px', color: 'var(--pine)' }}>SELECTED PROJECT</span>
                        <p style={{ fontWeight: '600', fontSize: '14px', marginTop: '2px', color: 'var(--ink)' }}>
                          {project.title}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                          Source: {project.source === 'faculty_pool' ? 'Faculty Pool' : 'Student Proposed'}
                        </p>

                        {/* Mentor Status Badge for Proposed Project */}
                        {project.source === 'student_proposed' && (
                          <div style={{ marginTop: '8px', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                            Mentor Status:{' '}
                            {project.mentorStatus === 'mentor_accepted' ? (
                              <span style={{ color: 'var(--success)', fontWeight: '600' }}>✓ Accepted</span>
                            ) : project.mentorStatus === 'mentor_rejected' ? (
                              <span style={{ color: 'var(--pine)', fontWeight: '600' }}>❌ Rejected (Pick another idea)</span>
                            ) : (
                              <span style={{ color: 'var(--clay)', fontWeight: '600' }}>⏳ Pending Faculty Review</span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="idea-meta" style={{ marginBottom: '14px' }}>
                        No idea selected yet — pick one from the list to lock in your project.
                      </p>
                    )}

                    {/* Members List */}
                    <div className="member-list">
                      {members.map((m) => (
                        <div key={m._id} className={`member ${m._id === user._id ? 'you' : ''}`}>
                          <span className="member-avatar">{getInitials(m.name)}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '500' }}>
                              {m.name} {m._id === user._id ? '(you)' : ''}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
                              {m.email}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Member Input */}
                    <form onSubmit={handleAddMember} className="add-member-row">
                      <input
                        type="email"
                        value={teammateEmail}
                        onChange={(e) => setTeammateEmail(e.target.value)}
                        placeholder="Teammate email address"
                      />
                      <button type="submit" disabled={addMemberAction.loading}>
                        {addMemberAction.loading ? 'Adding...' : 'Add'}
                      </button>
                    </form>

                    {/* Submit Button */}
                    <button
                      disabled={!canSubmit || submitTeamAction.loading}
                      onClick={handleSubmitTeamForApproval}
                      className="submit-btn"
                    >
                      {submitTeamAction.loading ? 'Submitting Team...' : 'Submit team for admin approval'}
                    </button>

                    {/* Submit Disable Reason Message */}
                    {!canSubmit && (
                      <p className="submit-hint" style={{ color: 'var(--pine)', fontWeight: '500' }}>
                        ⚠️ {submitDisabledReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Helpful Guidance Card */}
                <div className="card tip-card">
                  <p className="tip-head">💡 How capstone matching works</p>
                  <p className="tip-body">
                    Recommendations are ranked via Gemini 768-D vector embeddings matching your skills to faculty project descriptions. Ideas are filtered to your specific program duration and current academic year.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Idea Detail Modal */}
      {selectedIdeaDetail && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{ background: 'var(--surface)', width: '100%', maxWidth: '520px', borderRadius: 'var(--radius-lg)', padding: '28px', borderTop: '4px solid var(--pine)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--ink)', marginBottom: '6px' }}>
              {selectedIdeaDetail.title}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--ink-mute)', marginBottom: '14px' }}>
              Proposed by {selectedIdeaDetail.createdBy?.name || 'Faculty Member'} &bull; Target Tier: {selectedIdeaDetail.targetLevel?.toUpperCase()}
            </p>
            <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: '1.6', marginBottom: '20px' }}>
              {selectedIdeaDetail.description}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn-sm btn-ghost" onClick={() => setSelectedIdeaDetail(null)}>Close</button>
              <button
                className="btn-sm btn-select"
                onClick={() => {
                  handleSelectIdea(selectedIdeaDetail._id);
                  setSelectedIdeaDetail(null);
                }}
              >
                Select this idea
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lazily Loaded Interactive Capstone Workspace Modal */}
      <Suspense fallback={null}>
        <CapstoneWorkspaceModal
          isOpen={workspaceOpen}
          onClose={() => setWorkspaceOpen(false)}
          team={team}
          user={user}
        />
      </Suspense>
    </div>
  );
}

function StudentAuthFallback() {
  useEffect(() => {
    window.history.replaceState(null, '', '/auth');
  }, []);

  return (
    <SplitAuthPage
      portalName="Student Capstone Portal"
      initialRole="student"
      defaultMode="login"
    />
  );
}

function StudentPortalGate() {
  const { user, loading } = useAuth();
  const [ssoProcessing, setSsoProcessing] = useState(true);

  useEffect(() => {
    document.title = "Student Capstone Portal — DBUU ProjectMatch";
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = dbuuLogo;

    const tokenFromUrl = catchSSOToken();
    if (tokenFromUrl) {
      console.log('Caught SSO token from URL bar.');
    }
    setSsoProcessing(false);
  }, []);

  if (loading || ssoProcessing) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--paper)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
        color: 'var(--slate)',
      }}>
        ⚡ Verifying DBUU Student Session...
      </div>
    );
  }

  if (user) {
    if (user.role !== 'student') {
      const storedToken = localStorage.getItem('projectmatch_token');
      redirectToPortal(user.role, storedToken);
      return null;
    }
    return <StudentMainApp />;
  }

  return <StudentAuthFallback />;
}

export default function App() {
  return (
    <AuthProvider>
      <StudentPortalGate />
    </AuthProvider>
  );
}
