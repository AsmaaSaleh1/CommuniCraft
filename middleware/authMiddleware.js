
const authMiddleware = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next(); // User is authenticated, proceed to the next middleware
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = authMiddleware;
