/*
 * Copyright 2008 Netflix, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* Here's some JavaScript software for implementing OAuth.

   This isn't as useful as you might hope.  OAuth is based around
   allowing tools and websites to talk to each other.  However,
   JavaScript running in web browsers is hampered by security
   restrictions that prevent code running on one website from
   accessing data stored or served on another.

   Before you start hacking, make sure you understand the limitations
   posed by cross-domain XMLHttpRequest.

   On the bright side, some platforms use JavaScript as their
   language, but enable the programmer to access other web sites.
   Examples include Google Gadgets, and Microsoft Vista Sidebar.
   For those platforms, this library should come in handy.
*/

// The HMAC-SHA1 signature method calls b64_hmac_sha1, defined by
// http://pajhome.org.uk/crypt/md5/sha1.js
/* An OAuth message is represented as an object like this:
   {method: "GET", action: "http://server.com/path", parameters: ...}

   The parameters may be either a map {name: value, name2: value2}
   or an Array of name-value pairs [[name, value], [name2, value2]].
   The latter representation is more powerful: it supports parameters
   in a specific sequence, or several parameters with the same name;
   for example [["a", 1], ["b", 2], ["a", 3]].

   Parameter names and values are NOT percent-encoded in an object.
   They must be encoded before transmission and decoded after reception.
   For example, this message object:
   {method: "GET", action: "http://server/path", parameters: {p: "x y"}}
   ... can be transmitted as an HTTP request that begins:
   GET /path?p=x%20y HTTP/1.0
   (This isn't a valid OAuth request, since it lacks a signature etc.)
   Note that the object "x y" is transmitted as x%20y.  To encode
   parameters, you can call OAuth.addToURL, OAuth.formEncode or
   OAuth.getAuthorization.

   This message object model harmonizes with the browser object model for
   input elements of an form, whose value property isn't percent encoded.
   The browser encodes each value before transmitting it. For example,
   see consumer.setInputs in example/consumer.js.
 */

/* This script needs to know what time it is. By default, it uses the local
   clock (new Date), which is apt to be inaccurate in browsers. To do
   better, you can load this script from a URL whose query string contains
   an oauth_timestamp parameter, whose value is a current Unix timestamp.
   For example, when generating the enclosing document using PHP:

   <script src="oauth.js?oauth_timestamp=<?=time()?>" ...

   Another option is to call OAuth.correctTimestamp with a Unix timestamp.
 */

var OAuth;
if (OAuth == null) OAuth = {};

OAuth.setProperties = function setProperties(into, from) {
  if (into != null && from != null) {
    for (var key in from) {
      into[key] = from[key];
    }
  }
  return into;
}

OAuth.setProperties(OAuth, // utility functions
{
  percentEncode: function percentEncode(s) {
    if (s == null) {
      return "";
    }
    if (s instanceof Array) {
      var e = "";
      for (var i = 0; i < s.length; ++s) {
        if (e != "") e += '&';
        e += OAuth.percentEncode(s[i]);
      }
      return e;
    }
    s = encodeURIComponent(s);
    // Now replace the values which encodeURIComponent doesn't do
    // encodeURIComponent ignores: - _ . ! ~ * ' ( )
    // OAuth dictates the only ones you can ignore are: - _ . ~
    // Source: http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Functions:encodeURIComponent
    s = s.replace(/\!/g, "%21");
    s = s.replace(/\*/g, "%2A");
    s = s.replace(/\'/g, "%27");
    s = s.replace(/\(/g, "%28");
    s = s.replace(/\)/g, "%29");
    return s;
  },
  decodePercent: function decodePercent(s) {
    if (s != null) {
      // Handle application/x-www-form-urlencoded, which is defined by
      // http://www.w3.org/TR/html4/interact/forms.html#h-17.13.4.1
      s = s.replace(/\+/g, " ");
    }
    return decodeURIComponent(s);
  },
  /** Convert the given parameters to an Array of name-value pairs. */
  getParameterList: function getParameterList(parameters) {
    if (parameters == null) {
      return [];
    }
    if (typeof parameters != "object") {
      return OAuth.decodeForm(parameters + "");
    }
    if (parameters instanceof Array) {
      return parameters;
    }
    var list = [];
    for (var p in parameters) {
      list.push([p, parameters[p]]);
    }
    return list;
  },
  /** Convert the given parameters to a map from name to value. */
  getParameterMap: function getParameterMap(parameters) {
    if (parameters == null) {
      return {};
    }
    if (typeof parameters != "object") {
      return OAuth.getParameterMap(OAuth.decodeForm(parameters + ""));
    }
    if (parameters instanceof Array) {
      var map = {};
      for (var p = 0; p < parameters.length; ++p) {
        var key = parameters[p][0];
        if (map[key] === undefined) { // first value wins
          map[key] = parameters[p][1];
        }
      }
      return map;
    }
    return parameters;
  },
  getParameter: function getParameter(parameters, name) {
    if (parameters instanceof Array) {
      for (var p = 0; p < parameters.length; ++p) {
        if (parameters[p][0] == name) {
          return parameters[p][1]; // first value wins
        }
      }
    } else {
      return OAuth.getParameterMap(parameters)[name];
    }
    return null;
  },
  formEncode: function formEncode(parameters) {
    var form = "";
    var list = OAuth.getParameterList(parameters);
    for (var p = 0; p < list.length; ++p) {
      var value = list[p][1];
      if (value == null) value = "";
      if (form != "") form += '&';
      form += OAuth.percentEncode(list[p][0]) + '=' + OAuth.percentEncode(value);
    }
    return form;
  },
  decodeForm: function decodeForm(form) {
    var list = [];
    var nvps = form.split('&');
    for (var n = 0; n < nvps.length; ++n) {
      var nvp = nvps[n];
      if (nvp == "") {
        continue;
      }
      var equals = nvp.indexOf('=');
      var name;
      var value;
      if (equals < 0) {
        name = OAuth.decodePercent(nvp);
        value = null;
      } else {
        name = OAuth.decodePercent(nvp.substring(0, equals));
        value = OAuth.decodePercent(nvp.substring(equals + 1));
      }
      list.push([name, value]);
    }
    return list;
  },
  setParameter: function setParameter(message, name, value) {
    var parameters = message.parameters;
    if (parameters instanceof Array) {
      for (var p = 0; p < parameters.length; ++p) {
        if (parameters[p][0] == name) {
          if (value === undefined) {
            parameters.splice(p, 1);
          } else {
            parameters[p][1] = value;
            value = undefined;
          }
        }
      }
      if (value !== undefined) {
        parameters.push([name, value]);
      }
    } else {
      parameters = OAuth.getParameterMap(parameters);
      parameters[name] = value;
      message.parameters = parameters;
    }
  },
  setParameters: function setParameters(message, parameters) {
    var list = OAuth.getParameterList(parameters);
    for (var i = 0; i < list.length; ++i) {
      OAuth.setParameter(message, list[i][0], list[i][1]);
    }
  },
  /** Fill in parameters to help construct a request message.
        This function doesn't fill in every parameter.
        The accessor object should be like:
        {consumerKey:'foo', consumerSecret:'bar', accessorSecret:'nurn', token:'krelm', tokenSecret:'blah'}
        The accessorSecret property is optional.
     */
  completeRequest: function completeRequest(message, accessor) {
    if (message.method == null) {
      message.method = "GET";
    }
    var map = OAuth.getParameterMap(message.parameters);
    if (map.oauth_consumer_key == null) {
      OAuth.setParameter(message, "oauth_consumer_key", accessor.consumerKey || "");
    }
    if (map.oauth_token == null && accessor.token != null) {
      OAuth.setParameter(message, "oauth_token", accessor.token);
    }
    if (map.oauth_version == null) {
      OAuth.setParameter(message, "oauth_version", "1.0");
    }
    if (map.oauth_timestamp == null) {
      OAuth.setParameter(message, "oauth_timestamp", OAuth.timestamp());
    }
    if (map.oauth_nonce == null) {
      OAuth.setParameter(message, "oauth_nonce", OAuth.nonce(6));
    }
    OAuth.SignatureMethod.sign(message, accessor);
  },
  setTimestampAndNonce: function setTimestampAndNonce(message) {
    OAuth.setParameter(message, "oauth_timestamp", OAuth.timestamp());
    OAuth.setParameter(message, "oauth_nonce", OAuth.nonce(6));
  },
  addToURL: function addToURL(url, parameters) {
    newURL = url;
    if (parameters != null) {
      var toAdd = OAuth.formEncode(parameters);
      if (toAdd.length > 0) {
        var q = url.indexOf('?');
        if (q < 0) newURL += '?';
        else newURL += '&';
        newURL += toAdd;
      }
    }
    return newURL;
  },
  /** Construct the value of the Authorization header for an HTTP request. */
  getAuthorizationHeader: function getAuthorizationHeader(realm, parameters) {
    var header = 'OAuth realm="' + OAuth.percentEncode(realm) + '"';
    var list = OAuth.getParameterList(parameters);
    for (var p = 0; p < list.length; ++p) {
      var parameter = list[p];
      var name = parameter[0];
      if (name.indexOf("oauth_") == 0) {
        header += ',' + OAuth.percentEncode(name) + '="' + OAuth.percentEncode(parameter[1]) + '"';
      }
    }
    return header;
  },
  /** Correct the time using a parameter from the URL from which the last script was loaded. */
  correctTimestampFromSrc: function correctTimestampFromSrc(parameterName) {
    parameterName = parameterName || "oauth_timestamp";
    var scripts = document.getElementsByTagName('script');
    if (scripts == null || !scripts.length) return;
    var src = scripts[scripts.length - 1].src;
    if (!src) return;
    var q = src.indexOf("?");
    if (q < 0) return;
    parameters = OAuth.getParameterMap(OAuth.decodeForm(src.substring(q + 1)));
    var t = parameters[parameterName];
    if (t == null) return;
    OAuth.correctTimestamp(t);
  },
  /** Generate timestamps starting with the given value. */
  correctTimestamp: function correctTimestamp(timestamp) {
    OAuth.timeCorrectionMsec = (timestamp * 1000) - (new Date()).getTime();
  },
  /** The difference between the correct time and my clock. */
  timeCorrectionMsec: 0,
  timestamp: function timestamp() {
    var t = (new Date()).getTime() + OAuth.timeCorrectionMsec;
    return Math.floor(t / 1000);
  },
  nonce: function nonce(length) {
    var chars = OAuth.nonce.CHARS;
    var result = "";
    for (var i = 0; i < length; ++i) {
      var rnum = Math.floor(Math.random() * chars.length);
      result += chars.substring(rnum, rnum + 1);
    }
    return result;
  }
});

OAuth.nonce.CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";

/** Define a constructor function,
    without causing trouble to anyone who was using it as a namespace.
    That is, if parent[name] already existed and had properties,
    copy those properties into the new constructor.
 */
OAuth.declareClass = function declareClass(parent, name, newConstructor) {
  var previous = parent[name];
  parent[name] = newConstructor;
  if (newConstructor != null && previous != null) {
    for (var key in previous) {
      if (key != "prototype") {
        newConstructor[key] = previous[key];
      }
    }
  }
  return newConstructor;
}

/** An abstract algorithm for signing messages. */
OAuth.declareClass(OAuth, "SignatureMethod", function OAuthSignatureMethod() {});

OAuth.setProperties(OAuth.SignatureMethod.prototype, // instance members
{ /** Add a signature to the message. */
  sign: function sign(message) {
    var baseString = OAuth.SignatureMethod.getBaseString(message);
    var signature = this.getSignature(baseString);
    OAuth.setParameter(message, "oauth_signature", signature);
    return signature; // just in case someone's interested
  },
  /** Set the key string for signing. */
  initialize: function initialize(name, accessor) {
    var consumerSecret;
    if (accessor.accessorSecret != null && name.length > 9 && name.substring(name.length - 9) == "-Accessor") {
      consumerSecret = accessor.accessorSecret;
    } else {
      consumerSecret = accessor.consumerSecret;
    }
    this.key = OAuth.percentEncode(consumerSecret) + "&" + OAuth.percentEncode(accessor.tokenSecret);
  }
});

/* SignatureMethod expects an accessor object to be like this:
   {tokenSecret: "lakjsdflkj...", consumerSecret: "QOUEWRI..", accessorSecret: "xcmvzc..."}
   The accessorSecret property is optional.
 */
// Class members:
OAuth.setProperties(OAuth.SignatureMethod, // class members
{
  sign: function sign(message, accessor) {
    var name = OAuth.getParameterMap(message.parameters).oauth_signature_method;
    if (name == null || name == "") {
      name = "HMAC-SHA1";
      OAuth.setParameter(message, "oauth_signature_method", name);
    }
    OAuth.SignatureMethod.newMethod(name, accessor).sign(message);
  },
  /** Instantiate a SignatureMethod for the given method name. */
  newMethod: function newMethod(name, accessor) {
    var impl = OAuth.SignatureMethod.REGISTERED[name];
    if (impl != null) {
      var method = new impl();
      method.initialize(name, accessor);
      return method;
    }
    var err = new Error("signature_method_rejected");
    var acceptable = "";
    for (var r in OAuth.SignatureMethod.REGISTERED) {
      if (acceptable != "") acceptable += '&';
      acceptable += OAuth.percentEncode(r);
    }
    err.oauth_acceptable_signature_methods = acceptable;
    throw err;
  },
  /** A map from signature method name to constructor. */
  REGISTERED: {},
  /** Subsequently, the given constructor will be used for the named methods.
        The constructor will be called with no parameters.
        The resulting object should usually implement getSignature(baseString).
        You can easily define such a constructor by calling makeSubclass, below.
     */
  registerMethodClass: function registerMethodClass(names, classConstructor) {
    for (var n = 0; n < names.length; ++n) {
      OAuth.SignatureMethod.REGISTERED[names[n]] = classConstructor;
    }
  },
  /** Create a subclass of OAuth.SignatureMethod, with the given getSignature function. */
  makeSubclass: function makeSubclass(getSignatureFunction) {
    var superClass = OAuth.SignatureMethod;
    var subClass = function() {
        superClass.call(this);
      };
    subClass.prototype = new superClass();
    // Delete instance variables from prototype:
    // delete subclass.prototype... There aren't any.
    subClass.prototype.getSignature = getSignatureFunction;
    subClass.prototype.constructor = subClass;
    return subClass;
  },
  getBaseString: function getBaseString(message) {
    var URL = message.action;
    var q = URL.indexOf('?');
    var parameters;
    if (q < 0) {
      parameters = message.parameters;
    } else {
      // Combine the URL query string with the other parameters:
      parameters = OAuth.decodeForm(URL.substring(q + 1));
      var toAdd = OAuth.getParameterList(message.parameters);
      for (var a = 0; a < toAdd.length; ++a) {
        parameters.push(toAdd[a]);
      }
    }
    return OAuth.percentEncode(message.method.toUpperCase()) + '&' + OAuth.percentEncode(OAuth.SignatureMethod.normalizeUrl(URL)) + '&' + OAuth.percentEncode(OAuth.SignatureMethod.normalizeParameters(parameters));
  },
  normalizeUrl: function normalizeUrl(url) {
    var uri = OAuth.SignatureMethod.parseUri(url);
    var scheme = uri.protocol.toLowerCase();
    var authority = uri.authority.toLowerCase();
    var dropPort = (scheme == "http" && uri.port == 80) || (scheme == "https" && uri.port == 443);
    if (dropPort) {
      // find the last : in the authority
      var index = authority.lastIndexOf(":");
      if (index >= 0) {
        authority = authority.substring(0, index);
      }
    }
    var path = uri.path;
    if (!path) {
      path = "/"; // conforms to RFC 2616 section 3.2.2
    }
    // we know that there is no query and no fragment here.
    return scheme + "://" + authority + path;
  },
  parseUri: function parseUri(str) {
    /* This function was adapted from parseUri 1.2.1
           http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
         */
    var o = {
      key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
      parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/
      }
    };
    var m = o.parser.strict.exec(str);
    var uri = {};
    var i = 14;
    while (i--) uri[o.key[i]] = m[i] || "";
    return uri;
  },
  normalizeParameters: function normalizeParameters(parameters) {
    if (parameters == null) {
      return "";
    }
    var list = OAuth.getParameterList(parameters);
    var sortable = [];
    for (var p = 0; p < list.length; ++p) {
      var nvp = list[p];
      if (nvp[0] != "oauth_signature") {
        sortable.push([OAuth.percentEncode(nvp[0]) + " " // because it comes before any character that can appear in a percentEncoded string.
        +
        OAuth.percentEncode(nvp[1]), nvp]);
      }
    }
    sortable.sort(function(a, b) {
      if (a[0] < b[0]) return -1;
      if (a[0] > b[0]) return 1;
      return 0;
    });
    var sorted = [];
    for (var s = 0; s < sortable.length; ++s) {
      sorted.push(sortable[s][1]);
    }
    return OAuth.formEncode(sorted);
  }
});

OAuth.SignatureMethod.registerMethodClass(["PLAINTEXT", "PLAINTEXT-Accessor"], OAuth.SignatureMethod.makeSubclass(

function getSignature(baseString) {
  return this.key;
}));

OAuth.SignatureMethod.registerMethodClass(["HMAC-SHA1", "HMAC-SHA1-Accessor"], OAuth.SignatureMethod.makeSubclass(

function getSignature(baseString) {
  b64pad = '=';
  var signature = b64_hmac_sha1(this.key, baseString);
  return signature;
}));

try {
  OAuth.correctTimestampFromSrc();
} catch (e) {}

/*
 * Copyright (c) 2011-2012, IWAMURO Motonori
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice,
 *      this list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

var OAuthRequest = (function() {

  //
  // Constants
  //
  var _CRLF = "\r\n";

  var RT_JSON = "json";
  var RT_TEXT = "text";
  var RT_ARRAYBUFFER = "arraybuffer";

  //
  // Private functions
  //
  var _saveRequestToken = function(self, token, secret) {
      self.requestToken = token;
      self.requestTokenSecret = secret;
    };

  var _saveAccessToken = function(self, token, secret) {
      self.accessToken = token;
      self.accessTokenSecret = secret;
      var key = self.appId + ":" + self.consumerKey;
      localStorage[key] = btoa(token + "\n" + secret);
    };

  var _loadAccessToken = function(self) {
      var key = self.appId + ":" + self.consumerKey;
      var pair = localStorage[key];
      if (pair) {
        pair = atob(pair).split(/\n/);
        self.accessToken = pair[0];
        self.accessTokenSecret = pair[1];
      }
    };

  var _resetTokens = function(self) {
      delete self.requestToken;
      delete self.requestTokenSecret;
      delete self.accessToken;
      delete self.accessTokenSecret;
      delete localStorage[self.appId + ":" + self.consumerKey];
    };

  var _oauthMessage = function(self, method, url, data) {
      var message = {
        method: method,
        action: url,
        parameters: {
          oauth_consumer_key: self.consumerKey,
          oauth_signature_method: "HMAC-SHA1"
        }
      };
      var accessor = {
        consumerSecret: self.consumerSecret
      };

      if (self.accessToken) {
        message.parameters.oauth_token = self.accessToken;
        accessor.tokenSecret = self.accessTokenSecret;
      } else if (self.requestToken) {
        message.parameters.oauth_token = self.requestToken;
        accessor.tokenSecret = self.requestTokenSecret;
      }

      if (data) {
        for (var key in data)
        message.parameters[key] = data[key];
      }

      OAuth.setTimestampAndNonce(message);
      OAuth.SignatureMethod.sign(message, accessor);

      return message;
    };

  var _indent = function(level) {
      var indent = "";
      for (var i = 0; i < level; ++i)
      indent += "  ";
      return indent;
    };

  var _objectToString = function(object, level) {
      if (!level) level = 0;
      var buffer = "";
      for (var key in object) {
        var value = object[key];
        if (typeof value === "string") {
          buffer += _indent(level) + key + "=[" + value + "]\n";
        } else {
          buffer += _indent(level) + key + "=[\n" + _objectToString(value, level + 1) + _indent(level) + "]\n";
        }
      }
      return buffer;
    };

  var _defaultError = function(result, status, xhr) {
      var message = _objectToString(result);
      console.log(message);
      alert(message);
    };

  //  responseType = RT_JSON, RT_TEXT or RT_ARRAYBUFFER
  var _xhrRequest = function(method, url, params, body, responseType, success, error) {
      var xhr = new XMLHttpRequest();
      var ctype = null;
      if (params) {
        var pList = [];
        for (var key in params)
        pList.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
        params = (pList.length > 0) ? pList.join("&").replace(/%20/g, "+") : null;
      }
      switch (method) {
      case "GET":
      case "HEAD":
        if (params) url += "?" + params;
        break;

      case "POST":
        ctype = "application/x-www-form-urlencoded";
        body = params;
        break;

      case "PUT":
        if (params) url += "?" + params;
        if (typeof body === "string") ctype = "text/plain; charset=UTF-8";
        break;

      default:
        break;
      }
      xhr.open(method, url, true);
      if (ctype) xhr.setRequestHeader("Content-Type", ctype); // can't call before open
      switch (responseType) {
      case RT_JSON:
        xhr.setRequestHeader("Accept", "application/json, */*");
        xhr.responseType = RT_TEXT;
        break;

      case RT_TEXT:
        xhr.setRequestHeader("Accept", "text/*, */*");
        xhr.responseType = RT_TEXT;
        break;

      case RT_ARRAYBUFFER:
        xhr.setRequestHeader("Accept", "*/*");
        xhr.responseType = RT_ARRAYBUFFER;
        break;

      default:
        throw "Error: Unsupported response type: " + responseType;
      }
      xhr.onreadystatechange = function() {
        // readyState: 0=UNSENT,1=OPENED,2=HEADERS_RECEIVED,3=LOADING,4=DONE
        if (this.readyState == 4) {
          var result = this.response;
          if (this.status == 200) { // OK
            switch (responseType) {
            case RT_JSON:
              result = JSON.parse(result);
              break;

            case RT_ARRAYBUFFER:
              var bb = new WebKitBlobBuilder();
              bb.append(result);
              var ct = this.getResponseHeader("Content-Type");
              result = bb.getBlob(ct);
              break;

            default:
              break;
            }
            success(result, this.status, this);
          } else { // Error
            try {
              result = JSON.parse(result);
            } catch (e) {
              // ignore
            }
            error(result, this.status, this);
          }
        }
      };
      xhr.send(body);
    };

  //
  // Class Definition
  //
  var _class = function OAuthRequest() {};

  //
  // Export Constants
  //
  _class.RT_JSON = RT_JSON;
  _class.RT_TEXT = RT_TEXT;
  _class.RT_ARRAYBUFFER = RT_ARRAYBUFFER;

  //
  // Method Definitions
  //
  var _methods = {
    // Initialize
    initialize: function initialize(appId, consumerKey, consumerSecret) {
      this.appId = appId;
      if (consumerSecret) {
        this.consumerKey = consumerKey;
        this.consumerSecret = consumerSecret;
      } else {
        var pair = atob(consumerKey).split(/\n/);
        this.consumerKey = pair[0];
        this.consumerSecret = pair[1];
      }
      _loadAccessToken(this);
      this.defaultError = _defaultError;
      return this;
    }

    ,
    setDefaultError: function setDefaultError(defaultError) {
      this.defaultError = defaultError;
    }

    // Send OAuth'ed request
    ,
    request: function request(method, url, data, responseType, success, error) {
      var body = null;
      if (data instanceof Array) {
        body = data[1];
        data = data[0];
      }
      var message = _oauthMessage(this, method, url, data);
      _xhrRequest(method, url, OAuth.getParameterMap(message.parameters), body, responseType, success, error || this.defaultError);
    }

    // Authorize
    ,
    authorize: function authorize(oauth, success, error) {
      if (this.accessToken) {
        success();
        return;
      }

      var self = this;
      var getToken = function(url, saveToken, next) {
          self.request("GET", url, null, RT_TEXT, function(data) {
            // Success
            var pairs = data.split(/&/);
            var result = {};
            for (var i in pairs) {
              var pair = pairs[i].split(/=/, 2);
              result[pair[0]] = pair[1];
            }
            saveToken(self, result.oauth_token, result.oauth_token_secret);
            if (next) next();
          }, error);
        };

      getToken(
      oauth.requestTokenUrl, _saveRequestToken, function() {
        var authWindowId;
        var isSuccess = false;
        var onRequest = function(request, sender, callback) {
            if (sender.tab.windowId != authWindowId) return;
            if (onRequest) {
              chrome.extension.onRequest.removeListener(onRequest);
              onRequest = null;
            }
            if (request.isSuccess) {
              isSuccess = true;
              setTimeout(function() {
                chrome.windows.remove(authWindowId);
              }, 1000);
              getToken(oauth.accessTokenUrl, _saveAccessToken, success);
            }
          };
        chrome.extension.onRequest.addListener(onRequest);
        chrome.windows.onRemoved.addListener(function(windowId) {
          if (windowId == authWindowId && onRequest) {
            chrome.extension.onRequest.removeListener(onRequest);
            onRequest = null;
            if (!isSuccess) error({
              error: "Authorization refused."
            }, {});
          }
        });
        var page = oauth.authorizePage;
        chrome.windows.create({
          url: page.url(self.requestToken),
          focused: true,
          type: "popup"
        }, function(window) {
          authWindowId = window.id;
        });
      });
    }

    // Deauthorize
    ,
    deauthorize: function deauthorize() {
      _resetTokens(this);
    }
  };

  for (var name in _methods)
  _class.prototype[name] = _methods[name];

  return _class;
})();
