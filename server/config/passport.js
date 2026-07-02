const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/authModels");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // 1. Check if user exists
        let user = await User.findOne({ email });

        // 2. If not, create user
        if (!user) {
          user = await User.create({
            email,
            name: profile.displayName,
            googleId: profile.id,
            password: null,
            provider: "google",
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Required for session support
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});