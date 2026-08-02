import React from 'react';
import VectorMatchingDemo from './VectorMatchingDemo';

export default function AiSpecs() {
  return (
    <section id="ai-matching" style={{ background: 'var(--paper)', borderBottom: '1px solid var(--paper-line)' }}>
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">ProjectMatch Intelligence & Architecture</p>
          <h2 className="section-title">Replaces Google Forms & WhatsApp Groups with Semantic AI.</h2>
          <p className="section-sub">Engineered specifically for DBUU academic workflows to match student technical skill profiles with faculty research topics.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card reveal">
            <div className="feature-icon">⚡</div>
            <h3>Gemini AI Vector Matching</h3>
            <p>Uses <strong>Google Gemini text-embedding-004</strong> to convert student skills and interests into 768-dimensional profile vectors, computing real-time cosine similarity to rank the best-suited capstones.</p>
          </div>

          <div className="feature-card reveal">
            <div className="feature-icon">🔀</div>
            <h3>Dual Project Formation Paths</h3>
            <p><strong>Path A (Faculty Pool):</strong> Browse faculty-curated project topics with real-time team capacity tracking.<br /><br /><strong>Path B (Student Proposed):</strong> Propose custom research/startup capstones and request specific DBUU faculty mentorship.</p>
          </div>

          <div className="feature-card reveal">
            <div className="feature-icon">🎯</div>
            <h3>3-Tier Academic Leveling</h3>
            <p>Supports <strong>2nd Year Minor Projects I</strong> (Proof-of-concept), <strong>3rd Year Minor Projects II</strong> (Interdisciplinary implementation), and <strong>4th Year Major Capstone Dissertations</strong> (Publication & Deployment).</p>
          </div>

          <div className="feature-card reveal">
            <div className="feature-icon">🛡️</div>
            <h3>Departmental Oversight & Unassigned Placement</h3>
            <p>Admin officers can open or close the project formation window, approve final team lists, and run automated placement for unassigned students before deadlines.</p>
          </div>
        </div>

        {/* Embedded Interactive Vector Matching Demo Widget */}
        <VectorMatchingDemo />
      </div>
    </section>
  );
}
