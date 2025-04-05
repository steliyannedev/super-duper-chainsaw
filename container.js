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

module.exports = container;