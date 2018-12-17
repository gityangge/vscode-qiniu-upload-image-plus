const { window, commands, workspace } = require('vscode')
const path = require('path')
const qnUpload = require('./lib/upload')
const editor = window.activeTextEditor
const moment = require('moment')
const fs = require('fs')
const { spawn } = require('child_process')

const upload = (config, fsPath) => {
    if(!fsPath) return

    const editor = window.activeTextEditor
    const mdFilePath = editor.document.fileName
    const mdFileName = path.basename(mdFilePath, path.extname(mdFilePath))

    return qnUpload(config, fsPath, mdFileName).then(({ name, url }) => {
        console.log('Upload success!')

        const img = `![${name}](${url})`

        editor.edit(textEditorEdit => {
            textEditorEdit.insert(editor.selection.active, img)
        })
    })
}

const error = err => {
    window.showErrorMessage(err)
}

// this method is called when your extension is activated
exports.activate = context => {

    console.log('qiniu-upload-image is active!')

    const config = workspace.getConfiguration('qiniu')

    if (!config.enable) return

    const inputUpload = commands.registerCommand('extension.qiniu.upload', () => {

        if (!window.activeTextEditor) {
            window.showErrorMessage('没有打开编辑窗口')
            return
        }

        window.showInputBox({
            placeHolder: '输入一个图片地址'
        })
        .then(fsPath => upload(config, fsPath), error)
    });

    const selectUpload = commands.registerCommand('extension.qiniu.select', () => {
        window.showOpenDialog({
            filters: { 'Images': ['png', 'jpg', 'gif', 'bmp'] }
        }).then(result => {
            if (result) {
                const { fsPath } = result[0]
                return upload(config, fsPath)
            }
        }, error)
    });
    
    const copyclipboard = commands.registerCommand('extension.qiniu.copy', () => {
        pasteImageToQiniu();
    });

    context.subscriptions.push(inputUpload)
    context.subscriptions.push(selectUpload)
    context.subscriptions.push(copyclipboard)
}

// this method is called when your extension is deactivated
exports.deactivate = () => { }

function pasteImageToQiniu() {
        let fileUri = editor.document.uri;
        if (!fileUri) return;
    
        if (fileUri.scheme === 'untitled') {
            window.showInformationMessage('Before paste image, you need to save current edit file first.');
            return;
        }
    
        let selection = editor.selection;
        let selectText = editor.document.getText(selection);
    
        if (selectText && !/^[\w\-.]+$/.test(selectText)) {
            window.showInformationMessage('Your selection is not a valid file name!');
            return;
        }

        let config = workspace.getConfiguration('qiniu');


        let localPath = config['localPath'];
        if (localPath && (localPath.length !== localPath.trim().length)) {
            window.showErrorMessage('The specified path is invalid. "' + localPath + '"');
            return;
        }
        let filePath = fileUri.fsPath;
        let imagePath = getImagePath(filePath, selectText, localPath);
        createImageDirWithImagePath(imagePath).then(imagePath => {
            saveClipboardImageToFileAndGetPath(imagePath, (imagePath) => {
                if (!imagePath) return;
                if (imagePath === 'no image') {
                    return;
                }
        window.showInformationMessage('imagePath:' + imagePath)
                upload(config, imagePath).then(() => {
                    window.showInformationMessage('Upload success.');
                }).catch((err) => {
                    window.showErrorMessage('Upload error.');
                });
            });
        }).catch(err => {
            window.showErrorMessage('Failed make folder.');
            return;
        });
}
    

function getImagePath(filePath, selectText, localPath) {
    // 图片名称
    let imageFileName = '';
    if (!selectText) {
        imageFileName = moment().format("Y-MM-DD-HH-mm-ss") + '.png';
    } else {
        imageFileName = selectText + '.png';
    }

    // 图片本地保存路径
    let folderPath = path.dirname(filePath);
    let imagePath = '';
    if (path.isAbsolute(localPath)) {
        imagePath = path.join(localPath, imageFileName);
    } else {
        imagePath = path.join(folderPath, localPath, imageFileName);
    }

    return imagePath;
}

function createImageDirWithImagePath(imagePath) {
    return new Promise((resolve, reject) => {
        let imageDir = path.dirname(imagePath);
        fs.exists(imageDir, (exists) => {
            if (exists) {
                resolve(imagePath);
                return;
            }
            fs.mkdir(imageDir, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(imagePath);
            });
        });
    });
}

function saveClipboardImageToFileAndGetPath(imagePath, cb) {
    if (!imagePath) return;
    let platform = process.platform;
    if (platform === 'win32') {
        // Windows
        const scriptPath = path.join(__dirname, './lib/pc.ps1');
        const powershell = spawn('powershell', [
            '-noprofile',
            '-noninteractive',
            '-nologo',
            '-sta',
            '-executionpolicy', 'unrestricted',
            '-windowstyle', 'hidden',
            '-file', scriptPath,
            imagePath
        ]);
        powershell.on('exit', function (code, signal) {

        });
        powershell.stdout.on('data', function (data) {
            cb(data.toString().trim());
        });
    } else if (platform === 'darwin') {
        // Mac
        let scriptPath = path.join(__dirname, './lib/mac.applescript');

        let ascript = spawn('osascript', [scriptPath, imagePath]);
        ascript.on('exit', function (code, signal) {
            
        });

        ascript.stdout.on('data', function (data) {
            cb(data.toString().trim());
        });
    } else {
        // Linux 

        let scriptPath = path.join(__dirname, './lib/linux.sh');

        let ascript = spawn('sh', [scriptPath, imagePath]);
        ascript.on('exit', function (code, signal) {
            
        });

        ascript.stdout.on('data', function (data) {
            let result = data.toString().trim();
            if (result == "no xclip") {
                vscode.window.showInformationMessage('You need to install xclip command first.');
                return;
            }
            cb(result);
        });
    }
}