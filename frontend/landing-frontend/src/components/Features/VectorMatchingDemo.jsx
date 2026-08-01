import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_DEMO_PROJECTS, QUICK_SKILL_PRESETS } from '../../data/mockProjectsData';

export default function VectorMatchingDemo() {
  const [skillInput, setSkillInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');

  // Debounce input by 250ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInput(skillInput);
    }, 250);
    return () => clearTimeout(handler);
  }, [skillInput]);

  const activeQueryTerms = useMemo(() => {
    return debouncedInput
      .toLowerCase()
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean);
  }, [debouncedInput]);

  const rankedProjects = useMemo(() => {
    if (activeQueryTerms.length === 0) {
      return MOCK_DEMO_PROJECTS.map((p) => ({ ...p, score: p.baseScore }));
    }

    const scored = MOCK_DEMO_PROJECTS.map((p) => {
      let matches = 0;
      activeQueryTerms.forEach((term) => {
        const tagMatch = p.tags.some((t) => t.includes(term) || term.includes(t));
        const titleMatch = p.title.toLowerCase().includes(term);
        if (tagMatch) matches += 2;
        else if (titleMatch) matches += 1;
      });

      const score = matches > 0 ? Math.min(99, Math.max(50, p.baseScore + matches * 6)) : Math.max(35, p.baseScore - 25);
      return { ...p, score };
    });

    return scored.sort((a, b) => b.score - a.score);
  }, [activeQueryTerms]);

  return (
    <div className="demo-widget-card reveal" style={{ marginTop: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--pine)', marginBottom: '4px' }}>AI Vector Engine Demo</p>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '500', color: 'var(--ink)' }}>
            Interactive Vector Match Simulator
          </h3>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', background: 'var(--paper-2)', padding: '4px 10px', borderRadius: 'var(--radius)', color: 'var(--slate)', letterSpacing: '0.03em' }}>
          Google Gemini 768-D Vector Simulation
        </span>
      </div>

      {/* Quick Skill Presets Chips */}
      <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quick Try:</span>
        {QUICK_SKILL_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className="quick-chip"
            onClick={() => setSkillInput(preset)}
          >
            + {preset}
          </button>
        ))}
        {skillInput && (
          <button
            type="button"
            className="quick-chip"
            onClick={() => setSkillInput('')}
            style={{ background: 'rgba(196, 18, 48, 0.08)', color: 'var(--pine)', borderColor: 'var(--pine)' }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Input Field */}
      <div style={{ marginBottom: '24px', position: 'relative' }}>
        <label htmlFor="skill-demo-input" style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--ink-soft)', marginBottom: '8px', letterSpacing: '0.02em' }}>
          Try it &mdash; type a few skills (e.g. React, computer vision, IoT)
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: 'var(--ink-mute)' }}>🔍</span>
          <input
            id="skill-demo-input"
            className="demo-widget-input"
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="e.g. React, computer vision, IoT, python"
          />
        </div>
      </div>

      {/* Sorted Mock Projects List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {rankedProjects.map((project) => {
          const isMatched = activeQueryTerms.some((term) =>
            project.tags.some((t) => t.includes(term) || term.includes(t)) || project.title.toLowerCase().includes(term)
          );

          return (
            <div
              key={project.id}
              className={`demo-project-item ${isMatched ? 'matched-row' : ''}`}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--pine)', background: 'rgba(196, 18, 48, 0.08)', padding: '2px 8px', borderRadius: '3px', flexShrink: 0, fontWeight: '500' }}>
                    {project.school}
                  </span>
                  <h4 style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: '500', color: 'var(--ink)' }}>
                    {project.title}
                  </h4>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {project.tags.map((tag) => {
                    const isTagMatched = activeQueryTerms.some((term) => tag.includes(term) || term.includes(tag));
                    return (
                      <span
                        key={tag}
                        className={isTagMatched ? 'matched-tag' : ''}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: 'var(--ink-mute)',
                          background: 'var(--paper-2)',
                          padding: '2px 8px',
                          borderRadius: '3px',
                          transition: 'background 0.15s, color 0.15s',
                        }}
                      >
                        #{tag}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Similarity Score Readout */}
              <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '100px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px',
                    fontWeight: '600',
                    color: project.score >= 85 ? 'var(--pine)' : project.score >= 70 ? 'var(--slate)' : 'var(--ink-mute)',
                    display: 'block',
                    lineHeight: '1',
                  }}
                >
                  {project.score}%
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Vector Similarity
                </span>
                <div
                  style={{
                    width: '100%',
                    height: '3px',
                    background: 'var(--paper-2)',
                    borderRadius: '2px',
                    marginTop: '6px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${project.score}%`,
                      height: '100%',
                      background: project.score >= 85 ? 'var(--pine)' : project.score >= 70 ? 'var(--slate)' : 'var(--ink-mute)',
                      transition: 'width 0.4s ease-out',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--ink-mute)', marginTop: '20px', textAlign: 'center' }}>
        Demo only &mdash; real matching runs on your saved skill profile.
      </p>
    </div>
  );
}
