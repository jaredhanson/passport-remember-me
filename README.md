# Passport-Remember Me

[Passport](http://passportjs.org/) strategy for authenticating based on a
remember me cookie.

This module lets you authenticate using a remember me cookie (aka persistent
login) in your Node.js applications.  By plugging into Passport, remember me
authentication can be easily and unobtrusively integrated into any application
or framework that supports [Connect](http://www.senchalabs.org/connect/)-style
middleware, including [Express](http://expressjs.com/).

## Install

    $ npm install passport-remember-me

## Usage

#### Configure Strategy

The remember me authentication strategy authenticates users using a token stored
in a remember me cookie.  The strategy requires a `verify` callback, which
consumes the token and calls `done` providing a user.

The strategy also requires an `issue` callback, which issues a new token.  For
security reasons, remember me tokens should be invalidated after being used.
The `issue` callback supplies a new token that will be stored in the cookie for
next use.

    passport.use(new RememberMeStrategy(
      function(token, done) {
        Token.consume(token, function (err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          return done(null, user);
        });
      },
      function(user, done) {
        var token = utils.generateToken(64);
        Token.save(token, { userId: user.id }, function(err) {
          if (err) { return done(err); }
          return done(null, token);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'remember-me'` strategy, to
authenticate requests.

This is typically used in an application's middleware stack, to log the user
back in the next time they visit any page on your site.  For example:

    app.configure(function() {
      app.use(express.cookieParser());
      app.use(express.bodyParser());
      app.use(express.session({ secret: 'keyboard cat' }));
      app.use(passport.initialize());
      app.use(passport.session());
      app.use(passport.authenticate('remember-me'));
      app.use(app.router);
    });
    
Note that `passport.session()` should be mounted *above* `remember-me`
authentication, so that tokens aren't exchanged for currently active login
sessions.

#### Setting the Remember Me Cookie

If the user enables "remember me" mode, an initial cookie should be set when
they login.

    app.post('/login', 
      passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
      function(req, res, next) {
        // issue a remember me cookie if the option was checked
        if (!req.body.remember_me) { return next(); }
    
        var token = utils.generateToken(64);
        Token.save(token, { userId: req.user.id }, function(err) {
          if (err) { return done(err); }
          res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
          return next();
        });
      },
      function(req, res) {
        res.redirect('/');
      });

## Examples

For a complete, working example, refer to the [login example](https://github.com/jaredhanson/passport-remember-me/tree/master/examples/login).

## Tests

    $ npm install
    $ make test

[![Build Status](https://secure.travis-ci.org/jaredhanson/passport-remember-me.png)](http://travis-ci.org/jaredhanson/passport-remember-me)

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2013 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>
