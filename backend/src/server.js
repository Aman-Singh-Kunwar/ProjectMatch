const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const { corsMiddleware, getAllowedOrigins } = require('./middleware/cors');
const authRoutes = require('./routes/authRoutes');

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

// Root Landing Page HTML Dashboard
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
  <title>ProjectMatch — Backend Server Status</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f19;
      --card-bg: #111827;
      --border: #1f2937;
      --text: #f9fafb;
      --text-muted: #9ca3af;
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --success: #10b981;
      --danger: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .container { width: 100%; max-width: 900px; }
    .header { text-align: center; margin-bottom: 2rem; }
    .header h1 {
      font-size: 2.25rem; font-weight: 700;
      background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }
    .header p { color: var(--text-muted); font-size: 1rem; }
    .status-badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.875rem;
      font-weight: 600; margin-top: 0.75rem;
      background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2);
      color: var(--success);
    }
    .status-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background-color: var(--success); box-shadow: 0 0 8px var(--success);
    }
    .section-title {
      font-size: 1.1rem; font-weight: 600; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem;
    }
    .grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem; margin-bottom: 2rem;
    }
    .portal-card {
      background-color: var(--card-bg); border: 1px solid var(--border);
      border-radius: 0.75rem; padding: 1.25rem; text-decoration: none;
      color: var(--text); transition: all 0.2s ease;
      display: flex; flex-direction: column; justify-content: space-between;
    }
    .portal-card:hover {
      border-color: var(--primary); transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.2);
    }
    .portal-card.landing-card { border-color: rgba(99, 102, 241, 0.5); background: linear-gradient(135deg, #1e1b4b 0%, #111827 100%); }
    .portal-icon { font-size: 1.75rem; margin-bottom: 0.5rem; }
    .portal-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.25rem; }
    .portal-desc { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem; }
    .portal-url {
      font-family: monospace; font-size: 0.75rem; color: #818cf8;
      background: rgba(99, 102, 241, 0.1); padding: 0.25rem 0.5rem;
      border-radius: 0.375rem; width: fit-content;
    }
    .info-card {
      background-color: var(--card-bg); border: 1px solid var(--border);
      border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 2rem;
    }
    .info-row { display: flex; justify-content: space-between; padding: 0.65rem 0; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: var(--text-muted); }
    .info-value { font-weight: 600; font-family: monospace; }
    .val-online { color: var(--success); }
    .val-offline { color: var(--danger); }
    .footer { text-align: center; color: var(--text-muted); font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ProjectMatch API Server</h1>
      <p>Multi-Role Capstone Lifecycle Platform Backend</p>
      <div class="status-badge">
        <span class="status-dot"></span> Server Active on Port ${PORT}
      </div>
    </div>

    <div class="section-title">🌐 Launch Portals & Showcase</div>
    <div class="grid">
      <a href="${landingUrl}" target="_blank" class="portal-card landing-card">
        <div>
          <div class="portal-icon">✨</div>
          <div class="portal-title">Landing Showcase</div>
          <div class="portal-desc">Public Platform Gateway & Feature Overview</div>
        </div>
        <div class="portal-url">${landingUrl}</div>
      </a>

      <a href="${studentUrl}" target="_blank" class="portal-card">
        <div>
          <div class="portal-icon">🎓</div>
          <div class="portal-title">Student Portal</div>
          <div class="portal-desc">AI Recommendations & Team Builder</div>
        </div>
        <div class="portal-url">${studentUrl}</div>
      </a>

      <a href="${facultyUrl}" target="_blank" class="portal-card">
        <div>
          <div class="portal-icon">👨‍🏫</div>
          <div class="portal-title">Faculty Portal</div>
          <div class="portal-desc">Pool Ideas & Mentor Requests</div>
        </div>
        <div class="portal-url">${facultyUrl}</div>
      </a>

      <a href="${adminUrl}" target="_blank" class="portal-card">
        <div>
          <div class="portal-icon">🛡️</div>
          <div class="portal-title">Admin Portal</div>
          <div class="portal-desc">Approvals & Window Control</div>
        </div>
        <div class="portal-url">${adminUrl}</div>
      </a>
    </div>

    <div class="section-title">📊 System Health & Diagnostics</div>
    <div class="info-card">
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
        <span class="info-label">Health API Endpoint</span>
        <span class="info-value"><a href="/api/health" target="_blank" style="color: #818cf8;">/api/health</a></span>
      </div>
    </div>

    <div class="footer">
      ProjectMatch Backend v1.0.0 &bull; Built with Node.js & Express
    </div>
  </div>
</body>
</html>
  `;

  res.send(html);
});

// API Routes
app.use('/api/auth', authRoutes);

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
