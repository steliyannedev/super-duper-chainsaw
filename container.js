const EventEmitter = require('node:events');

const awilix = require('awilix')

const { Logger } = require('./src/utils/logger');


const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY
})

container.register({
    eventEmitter: awilix.asValue(new EventEmitter())
})

container.register({
    logger: awilix.asFunction(() => {
        return (context) =>  new Logger(context)
    }).singleton()
})

container.register({
    sequelize: awilix.asFunction(({}) => {
        const { Sequelize } = require('sequelize');
        return new Sequelize(process.env.DB_URI)
    }).singleton(),

    initDatabase: awilix.asFunction(({sequelize, logger, transaction, configuration}) => {
        return async () => {
            const dbLogger = logger('Database')

            try {
                await sequelize.authenticate()
                await sequelize.sync()
                dbLogger.info('Database synced')

            } catch (err) {
                dbLogger.error(`Database initialization failed: ${err}`)

                throw err;
            }
        }
    })
})

container.loadModules(['src/db/models/*.js'], {
    formatName: 'camelCase',
    resolverOptions: {
        lifetime: awilix.Lifetime.SINGLETON,
        register: awilix.asFunction
    }
})

container.register({
    configManagerService: awilix.asFunction(require('./src/utils/configManager'))
})

container.register({
    startServer: awilix.asFunction(require('./src/api/server'))
})

container.register({
    startMonitoring: awilix.asFunction(require('./src/blockchain/monitor'))
})

module.exports = container;