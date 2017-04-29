// ----------------------------------------------------------------------------
// Author: Jason Dudash
// Born on: 2017-04-28
// !!!!!!!!!!!!!!!!!!!!!!!!!!!
// WARNING: this is a weekend prototype extension for OpenShift, 
// the full version should organize the code into multiple files with 
// a smarter design, std logging, better aync call design, etc... 
// !!!!!!!!!!!!!!!!!!!!!!!!!!!
// ----------------------------------------------------------------------------

// FUTURE: this looks like a good extension to aspire to be as complete as:
// https://github.com/bradygaster/azure-tools-vscode

// NOTE: Use the console to output diagnostic information (console.log) and errors (console.error)

var vscode = require('vscode'); // VS Code extensibility API
var apiutils = require('./apiutils');
var prettyit = require('./prettythejson');

var token = 'FLAG_NEED_TOKEN';
var masterURL = 'FLAG_NEED_MASTERURL';
var currentProject = '/FLAG_NEED_PROJECT';
var projectsList = [];

var openshiftOutput = vscode.window.createOutputChannel('OpenShift Output');
openshiftOutput.show();
var statusBarItem;

//--------------------------------------------------------------------------------
function activate(context) {
    // NOTE: commands need to match the package.json file
    console.log('extension "openshift-vscode-extension"');

    var loggedIn = false;
    var configSettings = vscode.workspace.getConfiguration('openshift');
    currentProject = '/' + configSettings.get('defaultProject');

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    statusBarItem.text = 'OpenShift-Login';
    statusBarItem.tooltip = 'Click to Login';
    statusBarItem.command = 'openshift.login';
    statusBarItem.show();

    // ****** Login Command
    var disposable = vscode.commands.registerCommand('extension.login', function () {
        if (loggedIn) {
            openshiftOutput.append('You will be logged out of: ' + masterURL + '\n');
            // TODO: warn you will be logged out and get approval
        }
        token = configSettings.get('token');
        masterURL = configSettings.get('masterURL');
        var insecure = configSettings.get('insecure', true);
        vscode.window.showInputBox({prompt: 'Input a master URL (esc to use ' + masterURL + ')'})
            .then(value => {
                if (value == undefined) { // user hit escape, that's OK - use defaults
                } else if (value.length > 1) { masterURL = value; }
                vscode.window.showInputBox({prompt: 'Input a connection token (esc to use ' + token + ')'})
                .then(value => {
                    if (value == undefined) { // user hit escape, that's OK - use defaults
                    } else if (value.length > 1) { token = value; }
                    openshiftOutput.append('Attempting to login to: ' + masterURL + ' with token ' + token + '\n');
                    apiutils.oapiLogin(masterURL, token, insecure)
                        .then(value => {
                            // TODO: make sure login succeeded
                            loggedIn = true;
                            openshiftOutput.append('Logged into: ' + masterURL + ' with token ' + token + '\n');
                            
                            // poll for projects and add them to a status bar item for selection
                            apiutils.oapiGetProjects()
                                .then(value => {
                                    projectsList = apiutils.convertProjectsJsonToArray(value);
                                    openshiftOutput.append('Available projects are:' + projectsList + '\n\n');
                                    statusBarItem.text = currentProject;
                                    statusBarItem.tooltip = 'Logged into ' + masterURL;
                                    statusBarItem.command = null;
                                    // now put this into a downdown list somehow
                                    //statusBarItem.command = 'extension.selectProject';
                                    statusBarItem.show();
                                })
                                .catch(value => {
                                    openshiftOutput.append('ERROR GETTING PROJECTS LIST: \n' + value + '\n\n');
                                    return;
                                });
                        })
                        .catch(value => {
                            vscode.window.showErrorMessage('Error logging in');
                            openshiftOutput.append('ERROR: \n' + value + '\n\n');
                            return;
                        });
                });
            });
    });
    context.subscriptions.push(disposable);

    // ****** Logout Command
    var disposable = vscode.commands.registerCommand('extension.logout', function () {
        if (loggedIn) { openshiftOutput.append('You will be logged out of: ' + masterURL + '\n'); }
        apiutils.oapiLogout()
            .then(value => {
                openshiftOutput.append('LOGGED OUT \n');
            })
            .catch(value => {
                vscode.window.showErrorMessage('Error logging out');
                openshiftOutput.append('ERROR: \n' + value + '\n\n');
                return;
            });
        loggedIn = false;
        statusBarItem.text = 'OpenShift-Login';
        statusBarItem.tooltip = 'Click to Login';
        statusBarItem.command = 'extension.login';
    });
    context.subscriptions.push(disposable);

    // ****** Get Status Command
    disposable = vscode.commands.registerCommand('extension.getStatus', function () {
        if (!loggedIn) { vscode.window.showErrorMessage('Please login to an OpenShift cluster'); return; }
        
        //!!!!!!
        vscode.window.showErrorMessage('Status command not implemented yet');
        
        apiutils.oapiStatus(currentProject)
            .then(value => {
                openshiftOutput.append('STATUS: \n' + value + '\n\n');
            })
            .catch(value => {
                vscode.window.showErrorMessage('Error getting status');
                openshiftOutput.append('ERROR: \n' + value + '\n\n');
                return;
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
        if (text.length < 1) { // No selection
            vscode.window.showErrorMessage('Please select some text in your active text editor.');
            return; 
        }
        vscode.window.showInformationMessage('Describe: ' + text.valueOf());
        apiutils.oapiDescribe(text.valueOf(), currentProject)
            .then(value => {
                openshiftOutput.append('DESCRIBE ' + text.valueOf() + ' IN ' + currentProject + ':\n' + value + '\n\n');
            })
            .catch(value => {
                vscode.window.showErrorMessage('Error describing selected text');
                openshiftOutput.append('ERROR: \n' + value + '\n\n');
                return;
            });
    });
    context.subscriptions.push(disposable);

    // ****** Get Pods Command
    disposable = vscode.commands.registerCommand('extension.getPods', function () {
        if (!loggedIn) { vscode.window.showErrorMessage('Please login to an OpenShift cluster'); return; }
        apiutils.oapiPods(currentProject)
            .then(value => {
                // TODO: open results in a new file
                openshiftOutput.append('PODS IN ' + currentProject + ':\n' + JSON.stringify(value) + '\n\n');
            })
            .catch(value => {
                vscode.window.showErrorMessage('Error getting status');
                openshiftOutput.append('ERROR: \n' + value + '\n\n');
                return;
            });
    });
    context.subscriptions.push(disposable);

    // ****** Get Builds Command
    disposable = vscode.commands.registerCommand('extension.getBuilds', function () {
        if (!loggedIn) { vscode.window.showErrorMessage('Please login to an OpenShift cluster'); return; }
        apiutils.oapiBuilds(currentProject)
            .then(value => {
                openshiftOutput.append('BUILDS IN ' + currentProject + ':\n' + JSON.stringify(value) + '\n\n');
            })
            .catch(value => {
                vscode.window.showErrorMessage('Error getting status');
                openshiftOutput.append('ERROR: \n' + value + '\n\n');
                return;
            });
    });
    context.subscriptions.push(disposable);

    // ****** Logs Command
    disposable = vscode.commands.registerCommand('extension.getLogs', function () {
        if (!loggedIn) { vscode.window.showErrorMessage('Please login to an OpenShift cluster'); return; }

        //!!!!!!
        vscode.window.showErrorMessage('Logs command not implemented yet');
        
        // TOOD: popup a request to select the build you want logs for
        // vscode.window.showQuickPick()

        apiutils.oapiLogs(currentProject)
            .then(value => {
                openshiftOutput.append('LOGS IN ' + currentProject + ':\n' + value + '\n\n');
            })
            .catch(value => {
                vscode.window.showErrorMessage('Error getting status');
                openshiftOutput.append('ERROR: \n' + value + '\n\n');
                return;
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