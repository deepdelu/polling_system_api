/**
 * main routing file
 */

const express = require('express');
const router = express.Router();

// api routes
router.use('/api', require('./api'));


module.exports = router;