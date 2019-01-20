// dependencies
const express = require('express');
const {getCurrentGame} = require('./gameLogic');
const UserDetail = require('./models/user_detail');


const router = express.Router();

// api endpoints
router.get('/test', function (req, res) {
  res.send('hi');
});

router.get('/whoami', function(req, res) {
    if(req.isAuthenticated()) {
        UserDetail.findOne({_id: req.user.detail_id}).exec()
            .then(detail => res.send(
                {name: detail.name,
                 saved_pairs: detail.saved_pairs,
                 avatar: detail.avatar,
                 description: detail.description,
                 email: detail.email,
                 media: detail.media,
                 _id: req.user._id,
                 currentGame: getCurrentGame(user)}
                ))
            .catch(err => {
                console.log("failed in whoami");
                res.send({});
            });
    } else {
        res.send({});
    }
});

module.exports = router;