// Author: Jason Dudash
// NOTE: Use the console to output diagnostic information (console.log) and errors (console.error)

// !!!!!!!!!!!!!!!!!!!!!!!!!!!
// WARNING: this is a weekend prototype extension for OpenShift, 
// the full version should organize the code into multiple files with 
// a smarter design, logging, better aync call design, etc... 
// !!!!!!!!!!!!!!!!!!!!!!!!!!!

var vscode = require('vscode'); // VS Code extensibility API
var apiutils = require('./apiutils');

var token = 'FLAG_NEED_TOKEN';
var masterURL = 'FLAG_NEED_MASTERURL';

var openshiftOutput = vscode.window.createOutputChannel('OpenShift Output');
openshiftOutput.show();

//--------------------------------------------------------------------------------
function activate(context) {
    // NOTE: commands need to match the package.json file
    console.log('extension "openshift-vscode-extension"');

    var loggedIn = false;
    var configSettings = vscode.workspace.getConfiguration('openshift');

    // ****** Login Command
    var disposable = vscode.commands.registerCommand('extension.login', function () {
        if (loggedIn) {
            openshiftOutput.append('You will be logged out of: ' + masterURL + '\n');
            // TODO: warn you will be logged out and get approval
        }
        token = configSettings.get('token');
        masterURL = configSettings.get('masterURL');
        vscode.window.showInputBox({prompt: 'Input a master URL (esc to use ' + masterURL + ')'})
            .then(value => {
                if (value == undefined) {
                    vscode.window.showErrorMessage('Need a master to continue!');
                    return;
                }
                if (value.length > 1) { masterURL = value; }
                // override a token
                vscode.window.showInputBox({prompt: 'Input a connection token (esc to use ' + token + ')'})
                .then(value => {
                    if (value == undefined) {
                        vscode.window.showErrorMessage('Need a token to continue!');
                        return;
                    }
                    token = value;
                    openshiftOutput.append('Attempting to login to: ' + masterURL + ' with token ' + token + '\n');
                    apiutils.oapiLogin(masterURL, token)
                        .then(value => {
                            // TODO: make sure login succeeded
                            loggedIn = value;
                            loggedIn = true;
                            openshiftOutput.append('Logged in.\n');
                            vscode.window.showInformationMessage('Logged into: ' + masterURL + ' with token ' + token + '\n');
                        });
                });
            });
    });
    context.subscriptions.push(disposable);

    // ****** Logout Command
    var disposable = vscode.commands.registerCommand('extension.logout', function () {
        if (loggedIn) {
            openshiftOutput.append('You will be logged out of: ' + masterURL + '\n');
            // apiutils.oapiLogout();
        }
        loggedIn = false;
        vscode.window.showInformationMessage('Logged out');
    });
    context.subscriptions.push(disposable);

    // ****** Get Status Command
    disposable = vscode.commands.registerCommand('extension.getStatus', function () {
        if (!loggedIn) { vscode.window.showErrorMessage('Please login to an OpenShift cluster'); return; }
        apiutils.oapiStatus()
            .then(value => {
                // TODO: open results in a new file
                openshiftOutput.append('STATUS: \n' + value + '\n\n');
            });
    });
    context.subscriptions.push(disposable);

    // ****** Describe This Command
    disposable = vscode.commands.registerCommand('extension.describeThis', function () {
        if (!loggedIn) { vscode.window.showErrorMessage('Please login to an OpenShift cluster'); return; }
        var editor = vscode.window.activeTextEditor;
        if (!editor) { // No open text editor
            vscode.window.showErrorMessage('Must select text within an open file');
            return; 
        }
        var selection = editor.selection;
        var text = editor.document.getText(selection);
        if (!text.length < 1) { // No selection
            vscode.window.showErrorMessage('Must select some text.');
            return; 
        }
        vscode.window.showInformationMessage('Describe: ' + text.valueOf());
        apiutils.oapiDescribe(text.valueOf())
            .then(value => {
                openshiftOutput.append('DESCRIBE: \n' + value + '\n\n');
            });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;

//--------------------------------------------------------------------------------
function deactivate() {
    // TODO: clean up anything necessary (maybe logout?)
}

exports.deactivate = deactivate;