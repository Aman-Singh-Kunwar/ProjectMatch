import React from 'react';

export default function JourneyTracker({ team }) {
  const teamStatus = team ? team.status : null;
  const hasProject = Boolean(team && team.project);

  let activeStep = 1;
  if (!team || teamStatus === 'forming' || teamStatus === 'rejected') {
    activeStep = hasProject ? 2 : 1;
  } else if (teamStatus === 'pending_admin_approval') {
    activeStep = 3;
  } else if (teamStatus === 'approved') {
    activeStep = 4;
  }

  const steps = [
    { num: '01', label: '1. Select Capstone Idea', desc: 'Faculty pool or self-proposed' },
    { num: '02', label: '2. Form Roster & Invite', desc: 'Min 2 team members required' },
    { num: '03', label: '3. SOEC Department Approval', desc: 'Admin review queue' },
    { num: '04', label: '4. Active Capstone Workspace', desc: 'Milestones & deliverables' },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0A0F24 0%, #16214A 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '12px 0',
      }}
    >
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone = stepNum < activeStep;
          const isActive = stepNum === activeStep;

          return (
            <React.Fragment key={step.num}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  opacity: isActive || isDone ? 1 : 0.45,
                  padding: '6px 12px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(255, 215, 0, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(255, 215, 0, 0.35)' : '1px solid transparent',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }}
              >
                {/* Step Circle Badge */}
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: isDone
                      ? 'var(--success, #10B981)'
                      : isActive
                      ? '#FFD700'
                      : 'rgba(255, 255, 255, 0.15)',
                    color: isActive ? '#0A0F24' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '12px',
                    fontWeight: '700',
                    boxShadow: isActive ? '0 0 14px rgba(255, 215, 0, 0.4)' : 'none',
                    flexShrink: 0,
                  }}
                >
                  {isDone ? '✓' : step.num}
                </div>

                {/* Step Text Info */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      color: isActive ? '#FFD700' : '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: isActive ? '700' : '500',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {step.label}
                  </span>
                  <span
                    style={{
                      color: 'rgba(255, 255, 255, 0.65)',
                      fontSize: '10.5px',
                      fontFamily: 'var(--font-mono, monospace)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {step.desc}
                  </span>
                </div>
              </div>

              {/* Connector Arrow Line */}
              {idx < steps.length - 1 && (
                <div
                  style={{
                    width: '32px',
                    height: '2px',
                    background: isDone ? 'var(--success, #10B981)' : 'rgba(255, 255, 255, 0.15)',
                    flexShrink: 0,
                    borderRadius: '2px',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
