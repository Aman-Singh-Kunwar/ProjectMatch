import React from 'react';

export default function TheRoute() {
  return (
    <section className="route" id="how-it-works">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">The route</p>
          <h2 className="section-title">From Minor idea to Major workspace, in order.</h2>
        </div>
        <div className="route-list">
          <div className="route-item">
            <p className="route-num">01 / 04</p>
            <div><h4>Pick a line, or propose your own</h4><p>Select a faculty-listed topic in your SOEC degree program (2nd, 3rd, or 4th Year), or propose your own custom capstone idea and request a mentor.</p></div>
          </div>
          <div className="route-item">
            <p className="route-num">02 / 04</p>
            <div><h4>Form your team</h4><p>Add teammates by email. For self-proposed ideas, your requested faculty mentor accepts or declines before submission.</p></div>
          </div>
          <div className="route-item">
            <p className="route-num">03 / 04</p>
            <div><h4>Department approval</h4><p>Your team submission goes to the SOEC department administration for final review. Unassigned students are matched by admin after window close.</p></div>
          </div>
          <div className="route-item">
            <p className="route-num">04 / 04</p>
            <div><h4>Work in private team workspace</h4><p>Discussion thread, file attachments, milestone progress, and scheduled syncs &mdash; all in one place for the entire academic term.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
