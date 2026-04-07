import passport from 'passport';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js';

/**
 * Passport.js JWT Strategy Configuration
 * Used for authenticating requests with JWT tokens
 */

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
};

passport.use(
  'jwt',
  new JWTStrategy(opts, async (payload, done) => {
    try {
      const user = await User.findById(payload.userId);

      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      return done(null, {
        id: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      return done(error);
    }
  })
);

export default passport;
