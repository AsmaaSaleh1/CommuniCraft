const rateLimitingMiddleware = (req, res, next) => {
    next();
};
module.exports = rateLimitingMiddleware;
