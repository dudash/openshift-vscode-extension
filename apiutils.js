// ----------------------------------------------------------------------------
// Author: Jason Dudash
// Born on: 2017-04-28
// !!!!!!!!!!!!!!!!!!!!!!!!!!!
// WARNING: this is a weekend prototype extension for OpenShift, 
// the full version should organize the code into multiple files with 
// a smarter design, std logging, better aync call design, etc... 
// !!!!!!!!!!!!!!!!!!!!!!!!!!!
// ----------------------------------------------------------------------------

var fetch = require('node-fetch');

// need this for a custom https agent, see here: https://github.com/bitinn/node-fetch/issues/15
var https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

// yes, pretty hacky - but don't want to pass from extension.js everytime
// it will get updated on login calls only
// probably will write some sort of session class longer term...
var token = 'FLAG_NEED_TOKEN';
var masterURL = 'FLAG_NEED_MASTERURL';
var insecure = true;

const OAPIPROJ = "/oapi/v1/projects";
const APINS_PREFIX = "/api/v1/namespaces";
const OAPINS_PREFIX = "/oapi/v1/namespaces";
const PATH_PODS = "/pods";
const PATH_BUILDS = "/builds";
const PATH_BCS = "/buildconfigs";

//--------------------------------------------------------------------------------
var oapiLogin = function(m, t, i) {
    masterURL = m;
    var pattern = /^((http|https|ftp):\/\/)/;
    if(!pattern.test(masterURL)) {
        masterURL = "https://" + masterURL;
    }
    // TOOD: test for port on end and append 8443 if missing?
    
    token = t;
    
    insecure = i;
    // TODO: update agent with insecure setting

    return new Promise((resolve, reject) => {
        // TODO: in the future login with user/pass
        resolve();
    });
}

//--------------------------------------------------------------------------------
var oapiLogout = function() {
    return new Promise((resolve, reject) => {
        // TODO:
        resolve();
    });
}

//--------------------------------------------------------------------------------
var oapiGetProjects = function() {
    return new Promise((resolve, reject) => {
        var url = masterURL + OAPIPROJ;
        var opts = {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
			agent: agent
		};
        console.log('GET from ' + url + ' with token ' + token + ', insecure=' + insecure + '\n');
        fetch(url, opts)
            .then(function(res) {
                console.log('got a response from ' + url + '\n');
                return res.json();
            }).then(function(json) {
                console.log(json);
                console.log('------');
                console.log(convertProjectsJsonToArray(json));
                resolve(json);
            }).catch(function(err) {
                console.log(err);
                reject(err);
            });
    });
}

//--------------------------------------------------------------------------------
var oapiSetProject = function(project) {
    return new Promise((resolve, reject) => {
        var url = masterURL + OAPIPROJ + project;
        var opts = {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
			agent: agent
		};
        console.log('GET from ' + url + ' with token ' + token + ', insecure=' + insecure + '\n');
        fetch(url, opts)
            .then(function(res) {
                console.log('got a response from ' + url + '\n');
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

//--------------------------------------------------------------------------------
function convertProjectsJsonToArray(json) {
    var items = json.items;
    var projects = [];
    for(var i = 0; i < items.length; i++)
    {
        var name = items[i].metadata.name;
        projects.push(name);
    }
    return projects;
}

//--------------------------------------------------------------------------------
var oapiDescribe = function(item, inproject) {
    return new Promise((resolve, reject) => {
        var url = masterURL + OAPINS_PREFIX + inproject + '/' + item;
        var opts = {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
			agent: agent
		};
        console.log('GET from ' + url + ' with token ' + token + ', insecure=' + insecure + '\n');
        fetch(url, opts)
            .then(function(res) {
                console.log('got a response from ' + url + '\n');
                return res.text();
            }).then(function(body) {
                console.log(body);
                resolve(body);
            }).catch(function(err) {
                console.log(err);
                reject(err);
            });
    });
}

//--------------------------------------------------------------------------------
var oapiStatus = function(inproject) {
    return new Promise((resolve, reject) => {
        var url = masterURL + OAPINS_PREFIX + inproject ;
        var opts = {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
			agent: agent
		};
        // TODO: pull a bunch of status and consolidate into an single output
        resolve();
    });
}

//--------------------------------------------------------------------------------
var oapiPods = function(inproject) {
    return new Promise((resolve, reject) => {
        var url = masterURL + APINS_PREFIX + inproject + PATH_PODS;
        var opts = {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
			agent: agent
		};
        console.log('GET from ' + url + ' with token ' + token + ', insecure=' + insecure + '\n');
        fetch(url, opts)
            .then(function(res) {
                console.log('got a response from ' + url + '\n');
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

//--------------------------------------------------------------------------------
var oapiBuilds = function(inproject) {
    return new Promise((resolve, reject) => {
        var url = masterURL + OAPINS_PREFIX + inproject + PATH_BUILDS;
        var opts = {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
			agent: agent
		};
        console.log('GET from ' + url + ' with token ' + token + ', insecure=' + insecure + '\n');
        fetch(url, opts)
            .then(function(res) {
                console.log('got a response from ' + url + '\n');
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

//--------------------------------------------------------------------------------
var oapiBuildConfigs = function(inproject) {
    return new Promise((resolve, reject) => {
        var url = masterURL + OAPINS_PREFIX + inproject + PATH_BCS;
        var opts = {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
			agent: agent
		};
        console.log('GET from ' + url + ' with token ' + token + ', insecure=' + insecure + '\n');
        fetch(url, opts)
            .then(function(res) {
                console.log('got a response from ' + url + '\n');
                return res.json();
            }).then(function(json) {
                console.log(json);
                console.log('------');
                console.log(convertBuildConfigsJsonToArray(json));
                resolve(json);
            }).catch(function(err) {
                console.log(err);
                reject(err);
            });
    });
}

//--------------------------------------------------------------------------------
function convertBuildConfigsJsonToArray(json) {
    var items = json.items;
    var bcArray = [];
    for(var i = 0; i < items.length; i++)
    {
        var name = items[i].metadata.name;
        bcArray.push(name);
    }
    return bcArray;
}

//--------------------------------------------------------------------------------
var oapiLogs = function(inproject, resource) {
    return new Promise((resolve, reject) => {
        var url = masterURL + OAPINS_PREFIX + inproject + PATH_BCS + '/' + resource;
        var opts = {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
			agent: agent
		};
        console.log('GET from ' + url + ' with token ' + token + ', insecure=' + insecure + '\n');
        fetch(url, opts)
            .then(function(res) {
                console.log('got a response from ' + url + '\n');
                return res.text();
            }).then(function(body) {
                console.log(body);
                resolve(body);
            }).catch(function(err) {
                console.log(err);
                reject(err);
            });
    });
}

// export yo'shit
exports.oapiLogin = oapiLogin;
exports.oapiLogout = oapiLogout;
exports.oapiGetProjects = oapiGetProjects;
exports.oapiSetProject = oapiSetProject;
exports.convertProjectsJsonToArray = convertProjectsJsonToArray;
exports.oapiDescribe = oapiDescribe;
exports.oapiStatus = oapiStatus;
exports.oapiPods = oapiPods;
exports.oapiBuilds = oapiBuilds;
exports.oapiBuildConfigs = oapiBuildConfigs;
exports.convertBuildConfigsJsonToArray = convertBuildConfigsJsonToArray;
exports.oapiLogs = oapiLogs;
