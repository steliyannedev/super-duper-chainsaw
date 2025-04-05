class Logger {
    constructor(context){
        this.context = context;
    }

    _log(level, msg, meta = {}){
        const timestamp = new Date().toISOString();
        console.log(JSON.stringify({
            timestamp,
            level,
            context: this.context,
            msg,
            ...(Object.keys(meta).length > 0 ? {meta} : {})
        }))
    }

    info(msg, meta) {
        this._log('INFO', msg, meta);
    }

    error(msg, meta) {
        this._log('ERROR', msg, meta);
    }

    warn(msg, meta){
        this._log('WARN', msg, meta);
    }

    debug(msg, meta) {
        this._log('DEBUG', msg, meta);
    }
}

module.exports = { Logger }