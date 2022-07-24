export * from './debugLogger'

export function isObject(data: unknown) {
    return Object.prototype.toString.call(data) === '[object Object]'
}

export function get(object: any, path: string | string[], defaultValue?: any) {
    try {
        path = Array.isArray(path) ? path : path.replace(/\[/g, '.').replace(/\]/g, '').split('.')
        return path.reduce((o, k) => (o || {})[k], object) || defaultValue
    } catch (error) {
        return defaultValue
    }
}

export function isFunction(func: unknown) {
    return typeof func === 'function'
}

export function debounce<T extends (...args: any[]) => any>(fn: T, time = 1000) {
    let timeLock: NodeJS.Timer = null
    const finalFn = function (...args: any[]) {
        clearTimeout(timeLock)
        timeLock = setTimeout(() => {
            timeLock = null
            return fn(...args)
        }, time)
    }
    finalFn.stop = () => {
        if (timeLock) {
            clearTimeout(timeLock)
            timeLock = null
        }
    }
    return finalFn
}
