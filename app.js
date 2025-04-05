const container = require('./container')


async function startApp(){
    const logger = container.resolve('logger')('App');

    logger.info('Hello?')

    try {
        const { startServer } = container.resolve('startServer');
        const server = await startServer()
    } catch (err) {
        logger.error('Failed to start application: ', err)
    }
    
}

startApp();