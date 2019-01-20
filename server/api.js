// dependencies
const express = require('express');
const {getCurrentGame} = require('./gameLogic');


const router = express.Router();

// api endpoints
router.get('/test', function (req, res) {
  res.send('hi');
});

router.get('/whoami', function(req, res) {
    if(req.isAuthenticated()) {
        const user = Object.assign({}, req.user);
        user.currentGame = getCurrentGame(user);
        res.send(user);
    } else {
        res.send({});
    }
})

module.exports = router;