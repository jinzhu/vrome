var oauth = ChromeExOAuth.initBackgroundPage({
	'request_url' : 'https://www.google.com/accounts/OAuthGetRequestToken',
	'authorize_url' : 'https://www.google.com/accounts/OAuthAuthorizeToken',
	'access_url' : 'https://www.google.com/accounts/OAuthGetAccessToken',
	'consumer_key' : 'anonymous',
	'consumer_secret' : 'anonymous',
	'scope' : 'https://www.googleapis.com/auth/urlshortener',
	'app_name' : 'Vrome - URL Shortener',
});
