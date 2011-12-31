var oauth = ChromeExOAuth.initBackgroundPage({
	'request_url' : 'https://www.google.com/accounts/OAuthGetRequestToken',
	'authorize_url' : 'https://www.google.com/accounts/OAuthAuthorizeToken',
	'access_url' : 'https://www.google.com/accounts/OAuthGetAccessToken',
	'consumer_key' : 'anonymous',
	'consumer_secret' : 'anonymous',
	'scope' : 'https://www.googleapis.com/auth/urlshortener',
	'app_name' : 'Vrome - URL Shortener',
});

function chromeExOAuthOnAuthorize(token, secret) {
	if(typeof OnAuthorizeCallBack === 'function')
		 OnAuthorizeCallBack();
}

function grantOAuthAccess() {
	chrome.extension.getBackgroundPage().OnAuthorizeCallBack = OnAuthorize;
	chrome.tabs.create({url: '/oauth/chrome_ex_oauth.html'});
}

function OnAuthorize() {
	changeAccessButtonStatus(true);
	chrome.extension.getBackgroundPage().OnAuthorizeCallBack = undefined;
}

function revokeOAuthAccess() {
	chrome.extension.getBackgroundPage().oauth.clearTokens();
	changeAccessButtonStatus(false);
}

function changeAccessButtonStatus(granted) {
	document.getElementById('revokeAccess').disabled = !granted;
	document.getElementById('grantAccess').disabled = granted;
}
