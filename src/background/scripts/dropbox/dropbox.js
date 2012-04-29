// https://github.com/mooz/js2-mode
//
// Local Variables:
// mode: js2
// js2-basic-offset: 2
// indent-tabs-mode: nil
// End:
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

var Dropbox = (function(OAuthRequest) {

  //
  // Constants
  //
  // URLs
  var _API_VER = "1";
  var _API_URL = "https://api.dropbox.com/" + _API_VER + "/";
  var _CNT_URL = "https://api-content.dropbox.com/" + _API_VER + "/";
  // switch to "dropbox/" if you need to access the whole box instead of just the app's
  var _ACCESS_TYPE = "sandbox/"
  var _WWW_URL = "https://www.dropbox.com/" + _API_VER + "/";

  // Can't use following characters in filename:
  //   Control-Code, [:] [,] [;] [*] [?] ["] [<] [>] [|]
  var _INVALID_PATH_NAME_PATTERN = /[\x00-\x1f\x7f:,;*?\"<>|]/;

  // Authorize page size
  var _WIDTH = 900;
  var _HEIGHT = 600;

  //
  // Private functions
  //
  var _canonPath = function(path) {
      if (path.match(_INVALID_PATH_NAME_PATTERN)) throw "Error: Invalid character in path name.";
      return path.replace(/[\\\/]+/g, "/").replace(/^\//, "");
    };

  //
  // Class Definition
  //
  var _class = function Dropbox() {
      if (arguments.length == 0) return;
      this.initialize.apply(this, arguments);
    };

  // Inherit from OAuthRequest
  _class.prototype = new OAuthRequest();
  _class.prototype.constructor = OAuthRequest;
  _class.prototype.__super__ = OAuthRequest.prototype;

  //
  // Method Definitions
  //
  var _methods = {

    // Initialize
    initialize: function initialize(consumerKey, consumerSecret) {
      this.__super__.initialize.call(this, "Dropbox", consumerKey, consumerSecret);
      return this;
    }

    // Authorize
    ,
    authorize: function authorize(success, error) {
      this.__super__.authorize.call(this, {
        requestTokenUrl: _API_URL + "oauth/request_token",
        accessTokenUrl: _API_URL + "oauth/access_token",
        authorizePage: {
          url: function(requestToken) {
            return _WWW_URL + "oauth/authorize?oauth_token=" + requestToken;
          },
          width: _WIDTH,
          height: _HEIGHT
        }
      }, success, error);
    }

    // Get account information
    ,
    getAccountInfo: function getAccountInfo(success, error) {
      var url = _API_URL + "account/info";
      this.request("GET", url, {
        locale: "en"
      }, OAuthRequest.RT_JSON, success, error);
    }

    // Get metadata
    ,
    getMetadata: function getMetadata(path, success, error) {
      path = _canonPath(path);
      var url = _API_URL + "metadata/" + _ACCESS_TYPE + encodeURI(path);
      this.request("GET", url, {
        list: false,
        locale: "en"
      }, OAuthRequest.RT_JSON, success, error);
    }

    // Get revisions
    ,
    getRevisions: function getRevisions(path, success, error) {
      path = _canonPath(path);
      var url = _API_URL + "revisions/" + _ACCESS_TYPE + encodeURI(path);
      this.request("GET", url, {
        locale: "en"
      }, OAuthRequest.RT_JSON, success, error);
    }

    // Restore file content
    ,
    restoreFileContents: function restoreFileContents(path, rev, success, error) {
      path = _canonPath(path);
      var url = _API_URL + "restore/" + _ACCESS_TYPE + encodeURI(path);
      this.request("GET", url, {
        rev: rev,
        locale: "en"
      }, OAuthRequest.RT_JSON, success, error);
    }

    // Get metadata with item list
    ,
    getDirectoryContents: function getDirectoryContents(path, success, error) {
      path = _canonPath(path);
      var url = _API_URL + "metadata/" + _ACCESS_TYPE + encodeURI(path);
      this.request("GET", url, {
        file_limit: 1000,
        list: true,
        locale: "en"
      }, OAuthRequest.RT_JSON, success, error);
    }

    // Put file content (UTF-8 text only)
    //   dropbox.putFileContents(PATH, CONTENT, SUCCESS <, ERROR>);
    //     or
    //   dropbox.putFileContents(PATH, [OPTIONS, CONTENT], SUCCESS <, ERROR>);
    //   OPTIONS = {
    //     overwrite: true|false,
    //     parent_rev: REV
    //   }
    ,
    putFileContents: function putFileContents(path, content, success, error) {
      path = _canonPath(path);
      var url = _CNT_URL + "files_put/" + _ACCESS_TYPE + encodeURI(path);
      if (content instanceof Array) content[0].locale = "en";
      else content = [{
        locale: "en"
      },
      content];
      this.request("PUT", url, content, OAuthRequest.RT_JSON, success, error);
    }

    // Get file content
    ,
    getFileContents: function getFileContents(path, success, error) {
      path = _canonPath(path);
      var url = _CNT_URL + "files/" + _ACCESS_TYPE + encodeURI(path);
      this.request("GET", url, null, OAuthRequest.RT_TEXT, success, error);
    }

    // Get thumbnail image (result type is Blob)
    ,
    getThumbnail: function getThumbnail(path, size, format, success, error) {
      path = _canonPath(path);
      var url = _CNT_URL + "thumbnails/" + _ACCESS_TYPE + encodeURI(path);
      this.request("GET", url, {
        size: size,
        format: format
      }, OAuthRequest.RT_ARRAYBUFFER, success, error);
    }

    // Create directory
    ,
    createDirectory: function createDirectory(path, success, error) {
      path = _canonPath(path);
      this.request("POST", _API_URL + "fileops/create_folder", {
        root: "dropbox",
        path: path
      }, OAuthRequest.RT_JSON, success, error);
    }

    // Copy path
    ,
    copyPath: function copyPath(fromPath, toPath, success, error) {
      fromPath = _canonPath(fromPath);
      toPath = _canonPath(toPath);
      this.request("POST", _API_URL + "fileops/copy", {
        root: "dropbox",
        from_path: fromPath,
        to_path: toPath
      }, OAuthRequest.RT_JSON, success, error);
    }

    // Move path
    ,
    movePath: function movePath(fromPath, toPath, success, error) {
      fromPath = _canonPath(fromPath);
      toPath = _canonPath(toPath);
      this.request("POST", _API_URL + "fileops/move", {
        root: "dropbox",
        from_path: fromPath,
        to_path: toPath
      }, OAuthRequest.RT_JSON, success, error);
    }

    // Delete path
    ,
    deletePath: function deletePath(path, success, error) {
      path = _canonPath(path);
      this.request("POST", _API_URL + "fileops/delete", {
        root: "dropbox",
        path: path
      }, OAuthRequest.RT_JSON, success, error);
    }

    // Create shareable link
    ,
    createShares: function createShares(path, success, error) {
      path = _canonPath(path);
      var url = _API_URL + "shares/" + _ACCESS_TYPE + encodeURI(path);
      this.request("POST", url, {
        locale: "en"
      }, OAuthRequest.RT_JSON, success, error);
    }

    // Get direct link
    ,
    getDirectLink: function getDirectLink(path, success, error) {
      path = _canonPath(path);
      var url = _API_URL + "media/" + _ACCESS_TYPE + encodeURI(path);
      this.request("POST", url, {
        locale: "en"
      }, OAuthRequest.RT_JSON, success, error);
    }

    // Search
    ,
    search: function search(path, query, success, error) {
      path = _canonPath(path);
      var url = _API_URL + "search/" + _ACCESS_TYPE + encodeURI(path);
      this.request("POST", url, {
        query: query,
        locale: "en"
      }, OAuthRequest.RT_JSON, success, error);
    }

    // Logout
    ,
    logOutDropbox: function logOutDropbox() {
      this.deauthorize();
    }

  };

  for (var name in _methods)
  _class.prototype[name] = _methods[name];

  return _class;
})(OAuthRequest);

// https://github.com/mooz/js2-mode
//
// Local Variables:
// mode: js2
// js2-basic-offset: 2
// indent-tabs-mode: nil
// End:
