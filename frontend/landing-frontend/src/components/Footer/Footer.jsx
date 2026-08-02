import React from 'react';
import { dbuuFullLogo } from '@projectmatch/shared';

export default function Footer({ PORTALS }) {
  return (
    <footer id="contact">
      <div className="footer-brand">
        <img
          src={dbuuFullLogo}
          alt="Dev Bhoomi Uttarakhand University - 21 Years of Academic Excellence"
          loading="lazy"
          style={{
            height: '48px',
            width: 'auto',
            objectFit: 'contain',
            marginBottom: '12px',
            background: 'transparent',
          }}
        />
        <p className="name">ProjectMatch</p>
        <p className="affil">
          Minor & Major Capstone Platform for Dev Bhoomi Uttarakhand University (DBUU), Dehradun.<br />
          School of Engineering & Computing (SOEC), Manduwala, Dehradun, Uttarakhand 248007.
        </p>
      </div>
      <div className="footer-links-panel">
        <div className="footer-cols">
          <div className="footer-col">
            <p className="col-head">SOEC Programs</p>
            <a href="#soec-programs">B.Tech Computer Science (CSE)</a>
            <a href="#soec-programs">B.Tech AI & Machine Learning</a>
            <a href="#soec-programs">B.Tech Cyber Security</a>
            <a href="#soec-programs">Bachelor of Computer Apps (BCA)</a>
            <a href="#soec-programs">Master of Computer Apps (MCA)</a>
            <a href="#soec-programs">M.Tech Computer Science</a>
          </div>
          <div className="footer-col">
            <p className="col-head">Portals</p>
            <a href={PORTALS.STUDENT}>Student Portal</a>
            <a href={PORTALS.FACULTY}>Faculty Portal</a>
            <a href={PORTALS.ADMIN}>Admin Portal</a>
          </div>
          <div className="footer-col">
            <p className="col-head">Campus Contact</p>
            <a href="https://www.dbuu.ac.in/" target="_blank" rel="noreferrer">www.dbuu.ac.in</a>
            <a href="tel:18001034049">Toll Free: 1800 103 4049</a>
            <a href="mailto:info@dbuu.ac.in">info@dbuu.ac.in</a>
            <a href="#">Manduwala, Dehradun 248007</a>
          </div>
        </div>
        <p className="footer-fine">PROJECTMATCH &mdash; DEV BHOOMI UTTARAKHAND UNIVERSITY (DBUU)</p>
      </div>
    </footer>
  );
}
