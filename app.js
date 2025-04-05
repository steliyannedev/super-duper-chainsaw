const container = require('./container')

require('dotenv').config()


async function startApp(){
    const logger = container.resolve('logger')('App');

    logger.info('Hello?')

    try {
        const { startServer } = container.resolve('startServer');
        const server = await startServer()

        const { startMonitoring } = container.resolve('startMonitoring')
        await startMonitoring()
    } catch (err) {
        logger.error('Failed to start application: ', err)
    }
    
}

startApp();