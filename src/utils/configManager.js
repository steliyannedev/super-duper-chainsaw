module.exports = ({logger, configuration}) => {
    const configLogger = logger('ConfigManager')

    async function createConfiguration(configData) {
        try {
            const config = await configuration.create(configData)
            configLogger.info('Created new configuration', {id: config.id})

            return config
        }catch (err){
            configLogger.error(`Failed to create new configuration: ${err}`)
            throw err;
        }
    }

    async function loadActiveConfiguration(){
        try {
            const configs = await configuration.findAll({
                where: { active: true }
            })
            configLogger.info(`Loaded ${configs.length} active configurations`)
            
            return configs
        }catch (err){
            configLogger.error(`Error trying to fetch active configurations: ${err}`)
            throw err;
        }
    }

    return {
        createConfiguration,
        loadActiveConfiguration
    }
}