enum LogLevel {
    DEFAULT = 0,
    WARN,
    ERROR
}

let debugLevel: LogLevel = LogLevel.DEFAULT

let loggerFunction = (level: LogLevel, ...msg: any[]) => {
    const log = level === LogLevel.ERROR ? console.error : level === LogLevel.WARN ? console.warn : console.log
    log('[monitor-sdk]:', ...msg)
}

function setLogger(logger: () => void) {
    if (typeof logger === 'function') {
        loggerFunction = logger
    }
}

function setLoggerLevel(level: LogLevel) {
    debugLevel = level
}

function logger(level = LogLevel.DEFAULT, ...msg: any[]) {
    if (level < debugLevel) return
    loggerFunction(level, ...msg)
}

logger.logLevel = LogLevel

export {
    setLogger,
    setLoggerLevel,
    LogLevel,
    logger
}