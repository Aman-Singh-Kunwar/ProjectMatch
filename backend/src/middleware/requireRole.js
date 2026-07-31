/**
 * Role-based access control middleware
 * Accepts string or array of allowed roles
 * Usage: requireRole('faculty') or requireRole(['faculty', 'admin'])
 */
const requireRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden. Requires one of the following roles: [${roles.join(', ')}]`,
      });
    }

    next();
  };
};

module.exports = { requireRole };
