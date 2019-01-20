// dependencies
const express = require('express');
const {getCurrentGameCode} = require('./gameLogic');
const UserDetail = require('./models/user_detail');


const router = express.Router();

// api endpoints
router.get('/test', function (req, res) {
  res.send('hi');
});

router.get('/whoami', function(req, res) {
    if(req.isAuthenticated()) {
        res.send({_id: req.user._id, currentGameCode: getCurrentGameCode(req.user)});
    } else {
        res.send({});
    }
});

module.exports = router;