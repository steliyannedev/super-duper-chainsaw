module.exports = ({logger, configuration, eventEmitter}) => {
    const configLogger = logger('ConfigManager')

    async function getAllConfigurations() {
        try {
            const configs = await configuration.findAll();

            return configs
        }catch (err) {
            configLogger.error(`Error fetching all config: ${err}`)
            throw err
        }
    }

    async function updatedConfig(id, configData) {
        try {
            const config = await fetchConfigById(id)
            if (!config){
                return null
            }
            const updatedConfig = await configuration.update(
                {...configData,
                    rules: {...config.rules, ...configData.rules}
                },
                {
                    where: { id },
                    returning: true,
                    plain: true
                }
            )
            configLogger.info('Updated config', {configId: id})
            eventEmitter.emit('configUpdated', updatedConfig[1]);

            return updatedConfig;
        }catch (err) {
            configLogger.error(`Error while trying to update config: ${err}`, {
                configId: id
            })
            throw err;
        }
    }

    async function deleteConfig(id) {
        try {
            const config = await fetchConfigById(id)
            if (!config){
                return null;
            }
            await configuration.destroy({where: {id}})
            eventEmitter.emit('configDeleted', id);

            return true;
        }catch (err) {
            configLogger.error(`Error trying to delete config: ${err}`, {
                configId: id
            })

            throw err;
        }
    }

    async function fetchConfigById(id) {
        try {
            const config = await configuration.findByPk(id)

            return config
        } catch (err) {
            configLogger.error(`Error trying to fetch config: ${err}`, {configId: id})

            throw err
        }
    }

    async function createConfiguration(configData) {
        try {
            const config = await configuration.create(configData)
            configLogger.info('Created new configuration', {id: config.id})
            eventEmitter.emit('configCreated', config);

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
        loadActiveConfiguration,
        getAllConfigurations,
        fetchConfigById,
        updatedConfig,
        deleteConfig
    }
}