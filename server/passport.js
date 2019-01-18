const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const fs = require('fs');

const User = require('./models/user');

// set up passport configs
passport.use(new FacebookStrategy({
  clientID: 543314346187914,
  clientSecret: fs.readFileSync('secret.txt', 'utf8'),
  callbackURL: '/auth/facebook/callback',
  enableProof: true,
  profileFields: ['id', 'email', 'link', 'name_format', 'profile_pic']
}, function(accessToken, refreshToken, profile, done) {
  console.log(profile);
  User.findOne({
    'facebookId': profile.id
  }, function(err, user) {
    if (err) return done(err);

    if (!user) {
      const user = new User({
        name: profile.displayName,
        googleid: profile.id
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
