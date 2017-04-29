var fetch = require('node-fetch');

// yes, pretty hacky - but don't want to pass from extension.js everytime
// it will get updated on login calls only
// probably will write some sort of session class longer term...
var token = 'FLAG_NEED_TOKEN';
var masterURL = 'FLAG_NEED_MASTERURL';

//--------------------------------------------------------------------------------
var oapiLogin = function(m, t) {
    masterURL = m;
    var pattern = /^((http|https|ftp):\/\/)/;
    if(!pattern.test(masterURL)) {
        masterURL = "http://" + masterURL;
    }
    token = t;
    return new Promise((resolve, reject) => {
        // TODO: fetch and login
        resolve();
    });
}

//--------------------------------------------------------------------------------
var oapiLogout = function() {
    return new Promise((resolve, reject) => {
        resolve();
    });
}

//--------------------------------------------------------------------------------
var oapiDescribe = function() {
    return new Promise((resolve, reject) => {
        resolve();
    });
}

//--------------------------------------------------------------------------------
var oapiStatus = function() {
    return new Promise((resolve, reject) => {
    fetch('https://api.github.com/users/github')
        .then(function(res) {
            return res.json();
        }).then(function(json) {
            console.log(json);
            resolve(json);
        }).catch(function(err) {
            console.log(err);
            reject(err);
        });
    });
}

exports.oapiLogin = oapiLogin;
exports.oapiLogout = oapiLogout;
exports.oapiDescribe = oapiDescribe;
exports.oapiStatus = oapiStatus;