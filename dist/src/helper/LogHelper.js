"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = logError;
exports.logSuccess = logSuccess;
exports.logRegular = logRegular;
exports.logNotice = logNotice;
exports.logWarn = logWarn;
exports.logCustom = logCustom;
exports.logEmpty = logEmpty;
const util = require("util");
function logError(message) {
    console.log(formatLog('error', message, 'red'));
}
function logSuccess(message) {
    console.log(formatLog('info', message, 'green'));
}
function logRegular(message) {
    console.log(formatLog('info', message, 'white'));
}
function logNotice(message) {
    console.log(formatLog('info', message, 'magenta'));
}
function logWarn(message) {
    console.log(formatLog('warn', message, 'yellow'));
}
function logCustom(message, level = 'info') {
    console.log(formatLog(level, message));
}
function logEmpty() {
    console.log('');
}
function formatLog(level, message, color) {
    const timestamp = getTimeStamp();
    const levelStr = `[${level}]`;
    const formattedMessage = util.format(message);
    return color
        ? applyColor(`${levelStr} ${timestamp} ${formattedMessage}`, color)
        : `${levelStr} ${timestamp} ${formattedMessage}`;
}
function getTimeStamp() {
    const date = new Date();
    return `[${date.toISOString()}]`;
}
function applyColor(text, color) {
    const colors = {
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        white: '\x1b[37m',
        magenta: '\x1b[35m',
    };
    const reset = '\x1b[0m';
    return `${colors[color]}${text}${reset}`;
}
