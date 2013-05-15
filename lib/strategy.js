/**
 * Module dependencies.
 */
var passport = require('passport')
  , util = require('util')
  , utils = require('./utils');


/**
 * `Strategy` constructor.
 *
 * @param {Object} options
 * @api public
 */
function Strategy(options, verify, issue) {
  if (typeof options == 'function') {
    issue = verify;
    verify = options;
    options = {};
  }
  if (!verify) throw new Error('remember me cookie authentication strategy requires a verify function');
  if (!issue) throw new Error('remember me cookie authentication strategy requires an issue function');
  
  var opts = { path: '/', httpOnly: true, maxAge: 604800000 }; // maxAge: 7 days
  this._key = options.key || 'remember_me';
  this._opts = utils.merge(opts, options.cookie);
  
  passport.Strategy.call(this);
  this.name = 'remember-me';
  this._verify = verify;
  this._issue = issue;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on remember me cookie.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
  // The rememeber me cookie is only consumed if the request is not
  // authenticated.  This is in preference to the session, which is typically
  // established at the same time the remember me cookie is issued.
  if (req.isAuthenticated()) { return this.pass(); }
  
  var token = req.cookies[this._key];
  
  // Since the remember me cookie is primarily a convenience, the lack of one is
  // not a failure.  In this case, a response should be rendered indicating a
  // logged out state, rather than denying the request.
  if (!token) { return this.pass(); }
  
  var self = this;
  
  function verified(err, user, info) {
    if (err) { return self.error(err); }
    
    // Express exposes the response to the request.  We need the response to set
    // a cookie, so we'll grab it this way.  This breaks the encapsulation of
    // Passport's Strategy API, but is acceptable for this strategy.
    var res = req.res;
    
    if (!user) {
      // The remember me cookie was not valid.  However, because this
      // authentication method is primarily a convenience, we don't want to
      // deny the request.  Instead we'll clear the invalid cookie and proceed
      // to respond in a manner which indicates a logged out state.
      //
      // Note that a failure at this point may indicate a possible theft of the
      // cookie.  If handling this situation is a requirement, it is up to the
      // application to encode the value in such a way that this can be detected.
      // For a discussion on such matters, refer to:
      //   http://fishbowl.pastiche.org/2004/01/19/persistent_login_cookie_best_practice/
      //   http://jaspan.com/improved_persistent_login_cookie_best_practice
      //   http://web.archive.org/web/20130214051957/http://jaspan.com/improved_persistent_login_cookie_best_practice
      //   http://stackoverflow.com/questions/549/the-definitive-guide-to-forms-based-website-authentication
      
      res.clearCookie(self._key);
      return self.pass();
    }
    
    // The remember me cookie was valid and consumed.  For security reasons,
    // the just-used token should have been invalidated by the application.
    // A new token will be issued and set as the value of the remember me
    // cookie.
    function issued(err, val) {
      if (err) { return self.error(err); }
      res.cookie(self._key, val, self._opts);
      return self.success(user, info);
    }
    
    self._issue(user, issued);
  }
  
  self._verify(token, verified);
}


/**
 * Expose `Strategy`.
 */ 
module.exports = Strategy;
