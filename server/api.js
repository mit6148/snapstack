// dependencies
const express = require('express');
const UserDetail = require('./models/user_detail');
const User = require('./models/user');
const PCardRef = require('./models/pcardref');
const JCard = require('./models/jcard');
const connect = require('connect-ensure-login');
const {downloadImagePromise} = require('./storageTalk');
const {MEDIA_KEYS, MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH} = require('../config');
const db = require('./db');


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

router.get('/pcards/:_ids', connect.ensureLoggedIn(), async function(req, res) {
    try {
        if(!req.params._ids.match(/^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*/)) {
            res.status(400);
            res.send({status: 400, message: "invalid input"});
            return;
        }
        const _ids = req.params._ids.split(",");
        const pCardRefs = await PCardRef.find({_id: {$in: _ids}});
        const imagesPromise = Promise.all(pCardRefs.map(pCardRef => downloadImagePromise(pCardRef.image_ref)));
        const creators = await User.find({_id: {$in: pCardRefs.map(pCardRef => pCardRef.creator_id)}}).exec();
        const details = await UserDetail.find({_id: {$in: creators.map(creator => creator.detail_id)}}).exec();
        const detailIdToName = {};
        for(let detail of details) {
            detailIdToName[detail._id] = (detail.firstName && detail.lastName) ? detail.firstName + " " + detail.lastName[0]
                                                            : (detail.firstName || detail.lastName || "No Name");
        }
        const creatorIdToName = {};
        for(let creator of creators) {
            creatorIdToName[creator._id] = detailIdToName[creator.detail_id];
        }
        const images = await imagesPromise;
        const pcardIdToInfo = {};
        for(let i = 0; i < pCardRefs.length; i++) {
            pcardIdToInfo[pCardRefs[i]._id] = {_id: pCardRefs[i]._id, image: images[i], text: pCardRefs[i].text,
                                        creator_id: pCardRefs[i].creator_id, creator_name: creatorIdToName[pCardRefs[i].creator_id]};
        }

        const out = _ids.map(_id => pcardIdToInfo[_id]);
        res.send(out);
    } catch(err) {
        res.status(500);
        res.send({status: 500, message: "something went wrong"});
        console.error("error in fetching pcards: " + err.stack);
    }
});


router.get('/unsave/:_id', connect.ensureLoggedIn(), async function(req, res) {
    const session = await db.startSession();
    session.startTransaction();
    try {
        const match = await UserDetail.findOneAndUpdate({_id: req.user.detail_id, saved_pairs: {$elemMatch: {pcard: req.params._id}}},
                                                        {$pull: {saved_pairs: {pcard: req.params._id}}}).session(session).exec();
        if(match) {
            console.log("unsaved a card");
            await PCardRef.updateOne({_id: req.params._id}, {$inc: {ref_count: -1}}).session(session).exec();
            session.commitTransaction(); // WARNING: could also remove pcard here, but instead just wait for a server restart
            res.send({});
        } else {
            session.abortTransaction();
            console.log("failed to unsave");
            res.status(404);
            res.send({status: 404, message: "no such card saved, so can't unsave"});
        }
    } catch(err) {
        session.abortTransaction();
        console.error("failed to unsave with error: " + err.stack);
        res.status(500);
        res.send({status: 500, message: "something went wrong!"});
    }
});




router.post('/update/profile', connect.ensureLoggedIn(), async function(req, res) {
    // WARNING: validate image
    try {
        if(["avatar", "firstName", "lastName", "description"].every(a => typeof(req.body[a]) === 'string') &&
            req.body.media && Object.keys(req.body.media).every(key => MEDIA_KEYS.has(key)) &&
            req.body.firstName.length <= MAX_NAME_LENGTH && req.body.lastName.length <= MAX_NAME_LENGTH) {

            await UserDetail.updateOne({_id: req.user.detail_id},
                {$set: {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    avatar: req.body.avatar,
                    description: req.body.description,
                    media: req.body.media
                }}).exec();
        } else {
            console.error("failed to update profile due to bad input");
            res.status(400);
            res.send({status: 400, message: "bad input"});
        }
    } catch(err) {
        console.error("something went wrong while updating profile");
        res.status(500);
        res.send({status: 500, message: "something went wrong!"});
    }
});







module.exports = router;