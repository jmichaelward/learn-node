import path from 'path';
import util from 'util';
import { default as express } from 'express';
import { default as passport } from 'passport';
import { default as passportLocal } from 'passport-local';
import passportTwitter from 'passport-twitter';
import * as usersModel from '../models/users-superagent.mjs';
import { sessionCookieName } from '../app.mjs';
import DBG from 'debug';

export const router = express.Router();

const LocalStrategy = passportLocal.Strategy;
const TwitterStrategy = passportTwitter.Strategy;
const debug = DBG('notes:router-users');
const error = DBG('notes:error-users');

const twitterCallback = process.env.TWITTER_CALLBACK_HOST
  ? process.env.TWITTER_CALLBACK_HOST
  : 'http://localhost:3000';

export let twitterLogin;

if (typeof process.env.TWITTER_CONSUMER_KEY !== 'undefined'
  && process.env.TWITTER_CONSUMER_KEY !== ''
  && typeof process.env.TWITTER_CONSUMER_SECRET !== 'undefined'
  && process.env.TWITTER_CONSUMER_SECRET !== ''
) {
  passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: `${twitterCallback}/users/auth/twitter/callback`
  },
  async (token, tokenSecret, profile, done) => {
    try {
      const { username, provider, displayName, emails, photos } = profile;

      done(null, await usersModel.findOrCreate({
        id: username,
        username,
        password: '',
        provider,
        familyName: displayName,
        givenName: '',
        middleName: '',
        emails,
        photos
      }));
    } catch (error) {
      done(error);
    }
  }));

  twitterLogin = true;
} else {
  twitterLogin = false;
}

router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}));


router.get('/login', (request, response, next) => {
  try {
    response.render('login', {
      title: 'Login to Notes',
      user: request.user
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/', // SUCCESS: Go to home page
    failureRedirect: 'login', // FAIL: go to /users/login
  })
);

router.get('/logout', (request, response, next) => {
  try {
    request.session.destroy();
    request.logout();
    response.clearCookie(sessionCookieName);
    response.redirect('/');
  } catch(error) {
    next(error);
  }
});

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      let check = await usersModel.userPasswordCheck(username, password);

      if (check.check) {
        done(null, { id: check.username, username: check.username });
      } else {
        done(null, false, check.message);
      }
    } catch (error) {
      done(error);
    }
  }
));

/**
 * Encodes authentication data for the session.
 */
passport.serializeUser((user, done) => {
  try {
    done(null, user.username);
  } catch (error) {
    done(error);
  }
});

/**
 * Decodes authentication data for the session.
 */
passport.deserializeUser(async (username, done) => {
  try {
    let user = await usersModel.find(username);
    done(null, user);
  } catch (error) {
    done(error);
  }
});


export function initPassport(app) {
  app.use(passport.initialize());
  app.use(passport.session());
}

export function ensureAuthenticated(request, response, next) {
  try {
    // request.user is set by Passport in the deserialize function.
    if (request.user) {
      next();
    } else {
      response.redirect('/users/login');
    }
  } catch (error) {
    next(error);
  }
}
