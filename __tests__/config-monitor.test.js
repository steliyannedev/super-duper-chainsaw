const container = require('../container')

describe('Integrations: ConfigManager all CRUD methods and checking activity of configs', () => {
    let monitor, configManager, config;

    beforeAll(() => {
        configManager = container.resolve('configManagerService')
        monitor = container.resolve('startMonitoring'),

        monitor.setupConfigListeners()
    })

    test('should create configuration', async () => {
        config = await configManager.createConfiguration({
            name: 'Test Config',
            active: false,
            rules: {
                minValue: '1000000000000000000'
            }
        })
        await new Promise(resolve => setTimeout(resolve, 100))

        expect(monitor.getActiveConfiguration().some(c => c.id === config.id)).toBe(false)
    })
    
    test('should activate config by updating operation', async () => {
        const configData = {
            active: true
        }

        await configManager.updatedConfig(config.id, configData)
        await new Promise(resolve => setTimeout(resolve, 100))

        expect(monitor.getActiveConfiguration().some(c => c.id === config.id)).toBe(true)
    })

    test('should delete config', async () => {
        await configManager.deleteConfig(config.id)
        await new Promise(resolve => setTimeout(resolve, 100))

        expect(monitor.getActiveConfiguration().some(c => c.id === config.id)).toBe(false)
    })
})
