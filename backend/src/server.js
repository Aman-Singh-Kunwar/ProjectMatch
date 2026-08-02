const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const fs = require('fs');
const path = require('path');
const { corsMiddleware, getAllowedOrigins } = require('./middleware/cors');
const authRoutes = require('./routes/authRoutes');
const programRoutes = require('./routes/programRoutes');
const projectRoutes = require('./routes/projectRoutes');
const teamRoutes = require('./routes/teamRoutes');
const userRoutes = require('./routes/userRoutes');

// In local development, override DNS to Google Public DNS (8.8.8.8) if router DNS blocks SRV queries
if (process.env.NODE_ENV !== 'production') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    if (dns.setDefaultResultOrder) {
      dns.setDefaultResultOrder('ipv4first');
    }
  } catch (e) {
    // Fallback silently if OS restricts custom DNS servers
  }
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Environment validation checks
const validateEnv = () => {
  if (!process.env.JWT_SECRET) {
    console.warn('[env] missing required variable: JWT_SECRET');
  }
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[env] missing required variable: GEMINI_API_KEY');
  }
};

// Apply CORS middleware
app.use(corsMiddleware);
app.use(express.json());

// Serve DBUU Logo Asset Endpoint
app.get('/logo.jpeg', (req, res) => {
  const primaryPath = path.join(__dirname, '../../frontend/shared/src/assets/dbuu_logo.jpeg');
  if (fs.existsSync(primaryPath)) {
    return res.sendFile(primaryPath);
  }
  const altPath = path.join(__dirname, '../../frontend/shared/src/assets/dbuu-logo-png.jpeg');
  if (fs.existsSync(altPath)) {
    return res.sendFile(altPath);
  }
  return res.status(404).send('Logo file not found');
});

// Root Landing Page HTML Dashboard (DBUU Aesthetic Matched)
app.get('/', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  const landingUrl = process.env.LANDING_CLIENT_URL || 'http://localhost:5172';
  const studentUrl = process.env.STUDENT_CLIENT_URL || 'http://localhost:5173';
  const facultyUrl = process.env.FACULTY_CLIENT_URL || 'http://localhost:5174';
  const adminUrl = process.env.ADMIN_CLIENT_URL || 'http://localhost:5175';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ProjectMatch — DBUU API Server Status</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --paper:        #FFFFFF;
      --paper-2:      #F1F1F1;
      --paper-line:   rgba(0,0,0,0.10);
      --ink:          #1A1A1A;
      --ink-soft:     #4A4A4A;
      --ink-mute:     #7A7A7A;
      --pine:         #C41230;  /* DBUU Crimson Red */
      --pine-dark:    #9A0E26;
      --slate:        #16214A;  /* DBUU Navy */
      --clay:         #4A4740;  /* DBUU Graphite */
      --summit:       #D4A017;  /* DBUU Gold Accent */
      --font-display: 'Fraunces', Georgia, serif;
      --font-body:    'Inter', sans-serif;
      --font-mono:    'IBM Plex Mono', monospace;
      --radius:       4px;
      --radius-lg:    6px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-body);
      background-color: var(--paper-2);
      color: var(--ink);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    /* Utility Bar */
    .top-utility {
      background-color: var(--slate);
      color: #FFFFFF;
      padding: 8px 0;
      font-family: var(--font-mono);
      font-size: 11.5px;
      letter-spacing: 0.03em;
    }
    .top-utility-inner {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .status-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background-color: ${dbConnected ? '#4CAF6D' : '#E53935'};
      display: inline-block;
      box-shadow: 0 0 6px ${dbConnected ? '#4CAF6D' : '#E53935'};
    }
    /* Main Header */
    .main-header {
      background: var(--paper);
      border-bottom: 1px solid var(--paper-line);
      padding: 24px 0;
    }
    .main-header-inner {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo-img {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: 2px solid var(--pine);
      object-fit: cover;
      background: #ffffff;
      box-shadow: 0 2px 8px rgba(196, 18, 48, 0.15);
    }
    .brand-text h1 {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 500;
      color: var(--pine);
      line-height: 1.1;
    }
    .brand-text p {
      font-size: 12px;
      color: var(--slate);
      font-weight: 500;
      margin-top: 2px;
    }
    /* Container */
    .content-wrap {
      max-width: 1000px;
      margin: 36px auto;
      padding: 0 24px;
      width: 100%;
      flex: 1;
    }
    .section-head {
      margin-bottom: 20px;
    }
    .eyebrow {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--pine);
      margin-bottom: 4px;
    }
    .section-title {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 500;
      color: var(--ink);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 18px;
      margin-bottom: 40px;
    }
    .portal-card {
      background: var(--paper);
      border: 1px solid var(--paper-line);
      border-radius: var(--radius-lg);
      padding: 22px;
      text-decoration: none;
      color: var(--ink);
      transition: transform 150ms ease, box-shadow 150ms ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-top: 4px solid var(--pine);
    }
    .portal-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }
    .portal-card.landing { border-top-color: var(--pine); }
    .portal-card.student { border-top-color: var(--pine); }
    .portal-card.faculty { border-top-color: var(--slate); }
    .portal-card.admin { border-top-color: var(--clay); }
    
    .portal-icon { font-size: 2rem; margin-bottom: 10px; }
    .portal-name {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 500;
      color: var(--ink);
      margin-bottom: 4px;
    }
    .portal-desc {
      font-size: 13px;
      color: var(--ink-soft);
      line-height: 1.5;
      margin-bottom: 16px;
    }
    .portal-url {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--pine);
      background: rgba(196, 18, 48, 0.08);
      padding: 4px 10px;
      border-radius: var(--radius);
      width: fit-content;
      font-weight: 500;
    }
    .portal-card.faculty .portal-url { color: var(--slate); background: rgba(22, 33, 74, 0.08); }
    .portal-card.admin .portal-url { color: var(--clay); background: rgba(74, 71, 64, 0.08); }

    /* Health Info Panel */
    .info-panel {
      background: var(--paper);
      border: 1px solid var(--paper-line);
      border-top: 4px solid var(--slate);
      border-radius: var(--radius-lg);
      padding: 24px 28px;
    }
    .info-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid var(--paper-line);
      font-size: 14px;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: var(--ink-soft); }
    .info-value {
      font-family: var(--font-mono);
      font-size: 12.5px;
      font-weight: 500;
    }
    .val-online { color: #4CAF6D; font-weight: 600; }
    .val-offline { color: var(--pine); font-weight: 600; }

    /* Footer */
    footer {
      background: var(--slate);
      color: #FFFFFF;
      padding: 20px 0;
      margin-top: 40px;
      font-family: var(--font-mono);
      font-size: 11px;
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
  </style>
</head>
<body>
  <!-- Top Utility Bar -->
  <div class="top-utility">
    <div class="top-utility-inner">
      <span>DEV BHOOMI UTTARAKHAND UNIVERSITY &mdash; API SERVER</span>
      <span style="display: flex; align-items: center; gap: 8px;">
        <span class="status-dot"></span>
        API ACTIVE ON PORT ${PORT}
      </span>
    </div>
  </div>

  <!-- Main Header -->
  <div class="main-header">
    <div class="main-header-inner">
      <div class="brand-group">
        <img src="/logo.jpeg" alt="Dev Bhoomi Uttarakhand University Logo" class="brand-logo-img" />
        <div class="brand-text">
          <h1>ProjectMatch Engine</h1>
          <p>Backend API & Multi-Portal SSO Router</p>
        </div>
      </div>
      <a href="/api/health" target="_blank" style="font-family: var(--font-mono); font-size: 12px; color: var(--pine); background: rgba(196, 18, 48, 0.08); padding: 8px 14px; border-radius: var(--radius); text-decoration: none; font-weight: 500;">
        GET /api/health &rarr;
      </a>
    </div>
  </div>

  <!-- Main Content Wrap -->
  <div class="content-wrap">
    <div class="section-head">
      <p class="eyebrow">Monorepo Gateway</p>
      <h2 class="section-title">Launch Client Portals & Showcase</h2>
    </div>

    <div class="grid">
      <a href="${landingUrl}" target="_blank" class="portal-card landing">
        <div>
          <div class="portal-icon">✨</div>
          <div class="portal-name">Landing Showcase</div>
          <div class="portal-desc">Public showcase, AI vector match simulator, and SSO entry trailhead.</div>
        </div>
        <div class="portal-url">${landingUrl}</div>
      </a>

      <a href="${studentUrl}" target="_blank" class="portal-card student">
        <div>
          <div class="portal-icon">🎓</div>
          <div class="portal-title portal-name">Student Portal</div>
          <div class="portal-desc">SOEC Minor & Major project selection, AI recommendations, and team builder.</div>
        </div>
        <div class="portal-url">${studentUrl}</div>
      </a>

      <a href="${facultyUrl}" target="_blank" class="portal-card faculty">
        <div>
          <div class="portal-icon">👨‍🏫</div>
          <div class="portal-name">Faculty Portal</div>
          <div class="portal-desc">Publish pool ideas, review incoming mentor requests, and set milestones.</div>
        </div>
        <div class="portal-url">${facultyUrl}</div>
      </a>

      <a href="${adminUrl}" target="_blank" class="portal-card admin">
        <div>
          <div class="portal-icon">🛡️</div>
          <div class="portal-name">Admin Portal</div>
          <div class="portal-desc">Department approval, window control, and unassigned student placement.</div>
        </div>
        <div class="portal-url">${adminUrl}</div>
      </a>
    </div>

    <div class="section-head">
      <p class="eyebrow">Database & Services</p>
      <h2 class="section-title">System Health & Diagnostics</h2>
    </div>

    <div class="info-panel">
      <div class="info-row">
        <span class="info-label">Database Connection (MongoDB Atlas)</span>
        <span class="info-value ${dbConnected ? 'val-online' : 'val-offline'}">
          ${dbConnected ? 'CONNECTED ✅' : 'DISCONNECTED ❌'}
        </span>
      </div>
      <div class="info-row">
        <span class="info-label">AI Embedding Engine</span>
        <span class="info-value">${process.env.AI_PROVIDER || 'gemini'} (${process.env.GEMINI_MODEL || 'text-embedding-004'})</span>
      </div>
      <div class="info-row">
        <span class="info-label">Gemini API Key</span>
        <span class="info-value ${process.env.GEMINI_API_KEY ? 'val-online' : 'val-offline'}">
          ${process.env.GEMINI_API_KEY ? 'CONFIGURED ✅' : 'MISSING ❌'}
        </span>
      </div>
      <div class="info-row">
        <span class="info-label">Seeded Programs (SOEC)</span>
        <span class="info-value">BTECH_CSE, BTECH_AIML, BTECH_ECE, BTECH_CIVIL, BTECH_MECH, BCA</span>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer>
    PROJECTMATCH API ENGINE &bull; DEV BHOOMI UTTARAKHAND UNIVERSITY (DBUU)
  </footer>
</body>
</html>
  `;

  res.send(html);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);

// Health Check Route JSON
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    clientUrls: {
      landing: process.env.LANDING_CLIENT_URL || 'http://localhost:5172',
      student: process.env.STUDENT_CLIENT_URL || 'http://localhost:5173',
      faculty: process.env.FACULTY_CLIENT_URL || 'http://localhost:5174',
      admin: process.env.ADMIN_CLIENT_URL || 'http://localhost:5175',
    },
  });
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[server] error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Database Connection
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('[env] missing required variable: MONGO_URI');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[db] connected to MongoDB (${conn.connection.host}/${conn.connection.name || 'projectmatch'})`);
  } catch (error) {
    console.error('[db] connection failed:', error.message);
  }
};

if (require.main === module || require.main?.filename.endsWith('index.js')) {
  validateEnv();
  const origins = getAllowedOrigins();
  console.log(`[cors] allowed origins: ${origins.join(', ')}`);

  app.listen(PORT, async () => {
    console.log(`[server] listening on port ${PORT}`);
    await connectDB();
  });
}

module.exports = app;
