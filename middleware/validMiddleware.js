const validationMiddleware = (req, res, next) => {
    if (req.body && req.body.username && req.body.password) {
        next(); // Proceed if username and password are provided
    } else {
        res.status(400).json({ message: 'Username and password are required' });
    }
};
module.exports = validationMiddleware;
