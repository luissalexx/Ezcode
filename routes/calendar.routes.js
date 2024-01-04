const express = require('express');
const { createEvent } = require('../controllers/calendarc');

const router = express.Router();

router.post('/crear-evento', createEvent);

module.exports = router;