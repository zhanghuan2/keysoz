var Cookies = require("common/cookies/extend");

var SessionStorage = {
  _available: typeof window.sessionStorage != 'undefined' && typeof window.sessionStorage != null,
  set: function(c_name, value) {
    if(SessionStorage._available) {
      window.sessionStorage[c_name] = JSON.stringify(value);
    } else {
      var cookie = {};
      cookie[c_name] = value;
      var old = Cookies.get('_SessionStorage');
      if(old) {
        $.extend(old, cookie);
        Cookies.set('_SessionStorage', old, 1);
      } else {
        Cookies.set('_SessionStorage', cookie, 1);
      }
    }
  },
  get: function(c_name) {
    if(SessionStorage._available) {
      var result = window.sessionStorage[c_name];
      if(result) {
        return JSON.parse(result);
      } else {
        return result;
      }

    } else {
      var old = Cookies.get('_SessionStorage');
      if(old) {
        return old[c_name];
      } else {
        return undefined;
      }
    }
  },
  del: function(c_name) {
    if(SessionStorage._available) {
      /*支持IE8*/
      window.sessionStorage.removeItem(c_name);
      /*delete window.sessionStorage[c_name];*/
    } else {
      var old = Cookies.get('_SessionStorage');
      if(old) {
        delete old[c_name];
        Cookies.set('_SessionStorage', old);
      }
    }
  }
}

module.exports = SessionStorage;
