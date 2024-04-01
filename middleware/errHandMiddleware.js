const errorHandlerMiddleware = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
};
module.exports = errorHandlerMiddleware;
