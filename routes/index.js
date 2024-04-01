
const express = require('express');
const axios = require('axios');
const router = express.Router();
/*const loggingMiddleware = require('../middleware/logMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const errorHandlerMiddleware = require('../middleware/errHandMiddleware');
const validationMiddleware = require('../middleware/validMiddleware');
const rateLimitingMiddleware = require('../middleware/rateLimMiddleware');
router.use(loggingMiddleware);
router.use(authMiddleware);
router.use(validationMiddleware);
router.use(rateLimitingMiddleware);
*/
 router.get('/', function(req, res) {
   res.render('index', { title: 'Express' });
 });
 /*
router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});*/

//router.use(errorHandlerMiddleware);

module.exports = router;
