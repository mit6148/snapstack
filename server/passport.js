const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const fs = require('fs');
const path = require('path');

const User = require('./models/user');

// set up passport configs
passport.use(new FacebookStrategy({
  clientID: 543314346187914,
  clientSecret: process.env.FB_SECRET,
  callbackURL: 'http://localhost:3000/auth/facebook/callback',
  enableProof: true,
  profileFields: ['id', 'displayName', 'picture.type(large)']
}, function(accessToken, refreshToken, profile, done) {
  console.log(profile);
  User.findOne({
    'facebookId': profile.id
  }, function(err, user) {
    if (err) return done(err);

    if (!user) {
      const user = new User({
        name: profile.displayName,
        facebookId: profile.id
      });

      user.save(function(err) {
        if (err) console.log(err);

        return done(err, user);
      });
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
