import React from 'react';
import { dbuuFullLogo } from '@projectmatch/shared';

export default function Footer({ PORTALS }) {
  return (
    <footer id="contact">
      <div className="footer-brand">
        <img
          src={dbuuFullLogo}
          alt="Dev Bhoomi Uttarakhand University - 21 Years of Academic Excellence"
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
          Chakrata Road, Navgaon, Manduwala, Dehradun, Uttarakhand 248007.
        </p>
      </div>
      <div className="footer-links-panel">
        <div className="footer-cols">
          <div className="footer-col">
            <p className="col-head">Project Schools</p>
            <a href="#schools">School of Engineering (SOEC)</a>
            <a href="#schools">School of Management (SOMC)</a>
            <a href="#schools">School of Pharmacy (SOPR)</a>
            <a href="#schools">School of Architecture (SOADP)</a>
            <a href="#schools">School of Agriculture (SOAF)</a>
            <a href="#schools">School of Applied Sciences (SOBAS)</a>
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
