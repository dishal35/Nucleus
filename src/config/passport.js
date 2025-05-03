import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js"; // Your User model
import dotenv from "dotenv";

dotenv.config();

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Configure Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile:", profile); // Log the Google profile

        // Check if user already exists
        let user = await User.findOne({ where: { googleId: profile.id } });

        if (!user) {
          // Create a new user if not found
          user = await User.create({
            googleId: profile.id,
            fullName: profile.displayName, // Use Google profile name
            email: profile.emails[0].value, // Use Google profile email
            password: null, // No password for Google OAuth users
            role: "student", // Default role
            isVerified: true, // Mark as verified since Google verifies the email
            isVerifiedEmail: true,
          });
          console.log("New User Created:", user); // Log the newly created user
        }

        done(null, user);
      } catch (error) {
        console.error("Error in Google Strategy:", error); // Log the error
        done(error, null);
      }
    }
  )
);

export default passport;