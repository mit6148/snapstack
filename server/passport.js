const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const fs = require('fs');
const path = require('path');
const request = require('request');

const User = require('./models/user');
const UserDetail = require('./models/user_detail');

function getAvatarImagePromise(profile) { // always resolves
  return new Promise(function(resolve, reject) {
    const url = profile.photos[0].value;
    request.defaults({encoding: null}).get(url, function(err, response, body) {
      if(err || response.statusCode != 200) {
        resolve(undefined); // since must handle it the same way anyways
      } else {
        resolve("data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64'));
      }
    });
  });
}

// set up passport configs
passport.use(new FacebookStrategy({
  clientID: 543314346187914,
  clientSecret: process.env.FB_SECRET,
  callbackURL: '/auth/facebook/callback',
  enableProof: true,
  profileFields: ['id', 'first_name', 'last_name', 'picture.type(large)']
}, function(accessToken, refreshToken, profile, done) {
  User.findOne({
    'facebookId': profile.id
  }, function(err, user) {
    if (err) return done(err);

    if (!user) {

      getAvatarImagePromise(profile).then(function(image) {
        const userDetail = new UserDetail({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          saved_pairs: [],
          avatar: image,
          description: "I'm on SnapStack!",
          media: {},
        });

        const user = new User({
          facebookId: profile.id,
          detail_id: userDetail._id,
        });

        userDetail.save(function(err) {
          if(err) {
            console.log("error saving user details in passport: " + err);
          }
          return done(err, user);
        });

        user.save(function(err) {
          if(err) {
            console.log("error saving user in passport: " + err);
          }
          return done(err, user);
        });
      });
    } else {
      // TODO(niks): update user in case their Facebook profile changed
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
