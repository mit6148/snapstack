// dependencies
const express = require('express');
const UserDetail = require('./models/user_detail');
const User = require('./models/user');
const PCardRef = require('./models/pcardref');
const JCard = require('./models/jcard');
const connect = require('connect-ensure-login');
const {downloadImagePromise} = require('./storageTalk');


const router = express.Router();

router.get('/whoami', function(req, res) {
    if(req.isAuthenticated()) {
        res.send({_id: req.user._id});
    } else {
        res.send({_id: null});
    }
});


router.get('/profile/:_id', connect.ensureLoggedIn(), async function(req, res) {
    const _id = req.params._id;
    if(typeof(_id) !== 'string') {
        res.status(400);
        res.send({status: 400, message: "badly formatted id"}); // reject
    } else {
        try {
            const user = await User.findById(_id);
            const detail = await UserDetail.findById(user.detail_id);
            const jCardIds = detail.saved_pairs.map(pair => pair.jcard);
            const jCards = await JCard.find({_id: {$in: jCardIds}}).exec();
            const saved_pairs = detail.saved_pairs.map((pair, index) => ({jCardText: jCards[index].text, pCardId: pair.pcard}));
            res.send({
                _id: user._id,
                firstName: detail.firstName,
                lastName: detail.lastName,
                saved_pairs: saved_pairs,
                avatar: detail.avatar,
                description: detail.description,
                media: detail.media,
            });
        } catch(err) {
            res.status(404);
            res.send({status: 404, message: "user not found"});
        }
    }
});

router.get('/pcards', connect.ensureLoggedIn(), async function(req, res) {
    try {
        const _ids = Object.keys(req.query._ids || {}); // _ids is an object with the keys being desired ids, values not used
        const pCardRefs = await PCardRef.find({_id: {$in: _ids}});
        const images = await Promise.all(pCardRefs.map(pCardRef => downloadImagePromise(pCardRef.image_ref)));
        const out = {};
        for(let i = 0; i < pCardRefs.length; i++) {
            out[pCardRefs[i]._id] = {_id: pCardRefs[i]._id, image: images[i], text: pCardRefs[i].text, creator_id: pCardRefs[i].creator_id};
        }

        res.send(out);
    } catch(err) {
        res.status(500);
        res.send({status: 500, message: "something went wrong"});
        console.error("error in fetching pcards: " + err.stack);
    }
})

module.exports = router;