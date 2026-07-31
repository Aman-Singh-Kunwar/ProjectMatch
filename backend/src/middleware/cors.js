const cors = require('cors');

// Read separate client URLs for each portal
const getAllowedOrigins = () => {
  const studentUrl = process.env.STUDENT_CLIENT_URL || 'http://localhost:5173';
  const facultyUrl = process.env.FACULTY_CLIENT_URL || 'http://localhost:5174';
  const adminUrl = process.env.ADMIN_CLIENT_URL || 'http://localhost:5175';

  return [studentUrl, facultyUrl, adminUrl];
};

const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    // Allow server-to-server / non-browser requests or allowed frontend portal origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy violation: Origin ${origin} is not allowed`));
    }
  },
  credentials: true,
});

module.exports = { corsMiddleware, getAllowedOrigins };
