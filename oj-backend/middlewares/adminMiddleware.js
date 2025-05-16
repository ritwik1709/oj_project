export const adminMiddleware = (req, res, next) => {
  try {
    console.log('Admin Middleware - User:', {
      id: req.user.id,
      role: req.user.role
    });

    if (!req.user || !req.user.role) {
      console.log('Admin Middleware - No user or role found');
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
      console.log('Admin Middleware - User is not admin');
      return res.status(403).json({ message: 'Admin access required' });
    }

    console.log('Admin Middleware - Access granted');
    next();
  } catch (error) {
    console.error('Admin Middleware - Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
  