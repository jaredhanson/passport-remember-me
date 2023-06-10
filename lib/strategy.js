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
		this._opts = {path: '/', httpOnly: true, maxAge: 604800000, ...options.cookie};
		this._verify = verify;
		this._issue = issue;
	}

	authenticate(req, options)
	{
		let token;

		if (req.isAuthenticated())
			return (this.pass());
		token = req.cookies[this._key];
		if (!token)
			return (this.pass());
		this._verify(token, (err, user, info) =>
		{
			if (err)
				return this.error(err);
			if (!user)
			{
				req.res.clearCookie(this._key);
				return (this.pass());
			}
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
