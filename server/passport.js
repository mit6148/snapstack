const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const {fetchImagePromise} = require('./storageTalk');

const User = require('./models/user');
const UserDetail = require('./models/user_detail');

function getAvatarImagePromise(profile) { // always resolves
    return fetchImagePromise(profile.photos[0].value).catch(err => {
        console.error("getting avatar image failed with error: " + (err.stack || err));
        return undefined; // so the avatar will not be defined
    });
}

// set up passport configs
passport.use(new FacebookStrategy({
    clientID: 543314346187914,
    clientSecret: process.env.FB_SECRET,
    callbackURL: process.env.SNAPSTACK_CALLBACK_URL || '/auth/facebook/callback',
    enableProof: true,
    profileFields: ['id', 'first_name', 'last_name', 'picture.type(large)']
}, function(accessToken, refreshToken, profile, done) {
    User.findOne({
        'facebookId': profile.id
    }, async function(err, user) {
        if (err) return done(err);

        if (!user) {

            let user;

            try {
                const avatarPromise = getAvatarImagePromise(profile); // always resolves

                const userDetail = new UserDetail({
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    saved_pairs: [],
                    description: "I'm on SnapStack!",
                    media: {},
                });

                user = new User({
                    facebookId: profile.id,
                    detail_id: userDetail._id,
                });

                const userSavePromise = user.save().catch(err => {
                    console.error("error in login: failed to save user " + user._id);
                    return;
                });

                userDetail.avatar = await avatarPromise; // always resolves

                await userDetail.save();

                await userSavePromise;

                return done(null, user)
            } catch(err) {
                console.error("error in login: " + err);
                return done(err, user);
            }

        } else {
            return done(err, user);
        }
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

module.exports = passport;
