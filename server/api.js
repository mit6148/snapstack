// dependencies
const express = require('express');
const UserDetail = require('./models/user_detail');


const router = express.Router();

// api endpoints
router.get('/test', function (req, res) {
  res.send('hi');
});

router.get('/whoami', function(req, res) {
    if(req.isAuthenticated()) {
        res.send({_id: req.user._id});
    } else {
        res.send({_id: null});
    }
});

module.exports = router;