import passport from 'passport-strategy';

export default class Strategy extends passport.Strategy
{
	name = 'remember-me';

	/**
	 * `Strategy` constructor.
	 *
	 * @param {Object} options
	 * @api public
	 */
	constructor(options, verify, issue)
	{
		super();
		if (typeof options == 'function')
		{
			issue = verify;
			verify = options;
			options = {};
		}
		if (!verify)
			throw new Error('remember_me cookie authentication strategy requires a verify function');
		if (!issue)
			throw new Error('remember_me cookie authentication strategy requires an issue function');
		this._key = options.key ?? 'remember_me';
		this._opts = {path: '/', httpOnly: true, maxAge: 604800000, ...options.cookie}; // maxAge: 7 days by default
		this._verify = verify;
		this._issue = issue;
	}

	/**
	 * Authenticate request based on remember me cookie.
	 *
	 * @param {Express.Request} req
	 * @api protected
	 */
	authenticate(req, options)
	{
		let token;

		// The rememeber me cookie is only consumed if the request is not
		// authenticated.  This is in preference to the session, which is typically
		// established at the same time the remember me cookie is issued.
		if (req.isAuthenticated())
			return (this.pass());
		token = req.cookies[this._key];
		// Since the remember me cookie is primarily a convenience, the lack of one is
		// not a failure.  In this case, a response should be rendered indicating a
		// logged out state, rather than denying the request.
		if (!token)
			return (this.pass());
		this._verify(token, (err, user, info) =>
		{
			if (err)
				return this.error(err);
			if (!user)
			{
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
				req.res.clearCookie(this._key);
				return (this.pass());
			}
			// The remember me cookie was valid and consumed.  For security reasons,
			// the just-used token should have been invalidated by the application.
			// A new token will be issued and set as the value of the remember me
			// cookie.
			this._issue(user, (err, val) =>
			{
				if (err)
					return this.error(err);
				req.res.cookie(this._key, val, this._opts);
				return this.success(user, info);
			});
		});
	}
}
