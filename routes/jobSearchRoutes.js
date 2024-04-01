// routes/jobSearchRoutes.js
const express = require('express');
const router = express.Router();
const jobSearchController = require('../models/findjob.api');
// Route to search for jobs
router.get('/search', jobSearchController.searchJobs);

module.exports = router;
