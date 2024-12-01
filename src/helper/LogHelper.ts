import * as util from 'util';

export function logError(message: string): void {
    console.log(formatLog('error', message, 'red'));
}

export function logSuccess(message: string): void {
    console.log(formatLog('info', message, 'green'));
}

export function logRegular(message: string): void {
    console.log(formatLog('info', message, 'white'));
}

export function logNotice(message: string): void {
    console.log(formatLog('info', message, 'magenta'));
}

export function logWarn(message: string): void {
    console.log(formatLog('warn', message, 'yellow'));
}

export function logCustom(message: string, level: LogLevel = 'info'): void {
    console.log(formatLog(level, message));
}

export function logEmpty(): void {
    console.log('');
}

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'custom';

function formatLog(level: LogLevel, message: string, color?: ConsoleColor): string {
    const timestamp = getTimeStamp();
    const levelStr = `[${level}]`;
    const formattedMessage = util.format(message);

    return color
        ? applyColor(`${levelStr} ${timestamp} ${formattedMessage}`, color)
        : `${levelStr} ${timestamp} ${formattedMessage}`;
}

function getTimeStamp(): string {
    const date = new Date();
    return `[${date.toISOString()}]`;
}

type ConsoleColor = 'red' | 'green' | 'yellow' | 'white' | 'magenta';

function applyColor(text: string, color: ConsoleColor): string {
    const colors: Record<ConsoleColor, string> = {
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        white: '\x1b[37m',
        magenta: '\x1b[35m',
    };
    const reset = '\x1b[0m';

    return `${colors[color]}${text}${reset}`;
}
