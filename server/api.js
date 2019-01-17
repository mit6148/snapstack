// dependencies
const express = require('express');


const router = express.Router();

// api endpoints
router.get('/test', function (req, res) {
  res.send('hi');
});

module.exports = router;