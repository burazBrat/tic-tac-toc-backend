import {createLogger, transports, format, addColors} from 'winston';
import winstonDailyRotateFile from 'winston-daily-rotate-file';

const enumerateErrorFormat = format(info => {
    if (info instanceof Error) {
        return Object.assign(
            {
                message: info.message,
                stack: info.stack,
            },
            info,
        );
    }

    return info;
});

const console = new transports.Console({level: 'debug'});

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
}

addColors(colors)

const consoleRotateFile = new winstonDailyRotateFile({
    dirname: './logs',
    filename: 'app-console-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    maxFiles: '3d',
});

let option;
const customFormatter = format.combine(format.timestamp({format: 'YYYY-MM-DD HH:mm:ss:ms'}),
    enumerateErrorFormat(), format.json(), format.colorize({all: true}));

switch (process.env.NODE_ENV) {
    case 'development':
        option = {
            format: customFormatter,
            level: 'debug',
            transports: [console],
        };
        break;
    case 'production':
        option = {
            format: customFormatter,
            level: 'warn',
            transports: [consoleRotateFile],
        };
        break;
    default:
        option = {
            format: customFormatter,
            level: 'info',
            transports: [consoleRotateFile],
        };
        break;
}

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
}

const logger = createLogger({
        ...option,
        levels
    }
);

export {logger};
