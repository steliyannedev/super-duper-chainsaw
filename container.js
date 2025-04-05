const awilix = require('awilix')

const { Logger } = require('./src/utils/logger');


const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY
})
container.register({
    logger: awilix.asFunction((container) => {
        return (context) =>  new Logger(context)
    }).singleton()
})

container.register({
    startServer: awilix.asFunction(require('./src/api/server'))
})

container.register({
    startMonitoring: awilix.asFunction(require('./src/blockchain/monitor'))
})

module.exports = container;