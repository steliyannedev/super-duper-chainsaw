const container = require('./container')


async function startApp(){
    const logger = container.resolve('logger')('App');

    logger.info('Hello?')
    
}

startApp();