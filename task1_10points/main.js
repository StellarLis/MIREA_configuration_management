/*
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const os = require('os')
const fs = require('fs')
*/
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import os from 'os'
import fs from 'fs';
import { fileURLToPath } from 'url';


const args = process.argv.slice(2)
const userOptions = {}

args.forEach(arg => {
    if (arg.startsWith('--vfs=')) {
        userOptions.vfsPath = arg.split('=')[1]
    }
    if (arg.startsWith('--script=')) {
        userOptions.scriptPath = arg.split('=')[1]
    }
})

const terminalHistory = []

// Manage start script
if (userOptions.scriptPath) {
    const lines = fs.readFileSync(userOptions.scriptPath, 'utf-8').split('\n')
    for (const userInput of lines) {
        if (!userInput.trim()) continue
        const userInputFormatted = userInput.trim().replaceAll('\'', '').replaceAll('\"', '').split(' ');
        const command = userInputFormatted[0];
        const args = userInputFormatted.slice(1);

        let result = {}
        let isNeededRunning = true
        switch (command) {
            case 'ls':
                result = await command_ls(args)
                terminalHistory.push({
                    userInput: userInput,
                    output: result.value,
                    isError: !result.success
                });
                if (!result.success) isNeededRunning = false
                break;
            case 'cd':
                result = await command_cd(args)
                terminalHistory.push({
                    userInput: userInput,
                    output: result.value,
                    isError: !result.success
                });
                if (!result.success) isNeededRunning = false
                break;
        }
        if (!isNeededRunning) break;
    }
}

// Manage VFS

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(path.dirname(fileURLToPath(import.meta.url)), 'preload.js')
        }
    })

    win.loadFile('index.html')
}

ipcMain.handle('get-username-and-hostname', async (event) => {
    return { username: os.userInfo().username, hostname: os.hostname() }
})

ipcMain.handle('exit', async (event) => {
    app.quit()
})

ipcMain.handle('get-updates', async (event) => {
    return terminalHistory
})

// Commands calls
ipcMain.handle('command-ls', async (event, args) => {
    return command_ls(args)
})

ipcMain.handle('command-cd', async (event, args) => {
    return command_cd(args)
})

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// Commands realizations
async function command_ls(args) {
    if (args.length == 0) {
        return { success: true, value: 'ls была вызвана'}
    } else {
        let output = 'ls была вызвана с аргументами ';
        for (const arg of args) {
            output += arg + ' '
        }
        return { success: true, value: output }
    }
}

async function command_cd(args) {
    if (args.length == 0) {
        return { success: true, value: 'cd была вызвана'}
    } else {
        let output = 'cd была вызвана с аргументами ';
        for (const arg of args) {
            if (arg === '-err') return { success: false, value: 'Test error message!' }
            output += arg + ' '
        }
        return { success: true, value: output }
    }
}