const { ethers } = require('ethers')


module.exports = ({logger, configManagerService, transaction, eventEmitter}) => {
    const blockchainLogger = logger('Blockchain')

    let provider;
    let activeConfiguration = []

    function initProvider() {
        try {
            provider = new ethers.InfuraProvider(
                process.env.NETWORK || 'mainnet', 
                process.env.INFURA_API || ''
            )

            blockchainLogger.info(`Provider initialized on ${process.env.NETWORK}`)
        }catch (err){
            blockchainLogger.error(`Failed to initialize provider: ${err}`)
            throw err;
        }
    }

    async function startMonitoring(){
        try {
            if (!provider) {
                initProvider();
            }
            activeConfiguration = await configManagerService.loadActiveConfiguration()

            setupConfigListeners();
            
            provider.on('block', async (blockNumber) =>  {
                await processBlock(blockNumber);
            })
            
            blockchainLogger.info('Monitoring on blockchain started')
        } catch (err){
            blockchainLogger.error(`Failed to start monitoring: ${err}`)
            throw err;
        }
    }

    function matchingTransaction(tx, config) {
        const rules = config.rules;
        // to handles case for contract creation aka. where tx.to == null
        if (rules.toAddress && !tx.to && rules.toAddress !== '0x') {
            return false
        }

        if (rules.toAddress && tx.to && rules.toAddress.toLowerCase() !== tx.to.toLowerCase()) {
            return false
        }

        if (rules.fromAddress && tx.from && rules.fromAddress.toLowerCase() !== tx.from.toLowerCase()) {
            return false
        }
        
        if (rules.minValue && BigInt(tx.value) < BigInt(rules.minValue)) {
            return false
        }

        if (rules.maxValue && BigInt(tx.value) > BigInt(rules.maxValue)) {
            return false
        }

        return true
    }

    async function storeTransaction(tx, configId, timestamp) {
        try {
            const txReceipt = await provider.getTransactionReceipt(tx.hash)
            await transaction.create({
                configurationId: configId,
                transactionHash: tx.hash,
                blockNumber: tx.blockNumber,
                fromAddress: tx.from,
                toAddress: tx.to,
                value: tx.value.toString(),
                gasUsed: txReceipt ? txReceipt.gasUsed.toString() : '0',
                data: tx.data,
                timestamp: new Date(timestamp * 1000)
            })
            blockchainLogger.info('Matching transaction stored', {hash: tx.hash, configId})
        }catch (err){
            blockchainLogger.error(`Error saving matching transaction: ${err}`)
            throw err;
        }
    }

    async function processBlock(blockNumber){
        try {
            const block = await provider.getBlock(blockNumber, true)
            blockchainLogger.info(
                `Processing block ${blockNumber} with ${Array.from(block.transactions).length} transactions`
            )
            for (const tx of block.prefetchedTransactions){
                for (const config of activeConfiguration){
                    if (matchingTransaction(tx, config)){
                        await storeTransaction(tx, config.id, block.timestamp)
                    }
                }
            }
        }catch (err){
            blockchainLogger.error(`Failed to process block ${blockNumber} with error: ${err}`)
        }
    }

    async function refreshActiveConfigurations() {
        activeConfiguration = await configManagerService.loadActiveConfiguration();
        blockchainLogger.info(`Refreshed active configurations, now tracking ${activeConfiguration.length} configurations`);
    }

    function setupConfigListeners() {
        eventEmitter.on('configCreated', async (config) => {
            blockchainLogger.info('Event received: configCreated', { configId: config.id });
            await refreshActiveConfigurations();
        });
        
        eventEmitter.on('configUpdated', async (config) => {
            blockchainLogger.info('Event received: configUpdated', { configId: config.id });
            await refreshActiveConfigurations();
        });
        
        eventEmitter.on('configDeleted', async (configId) => {
            blockchainLogger.info('Event received: configDeleted', { configId });
            await refreshActiveConfigurations();
        });
        
        blockchainLogger.info('Config event listeners setup complete');
    }

    return { 
        startMonitoring, 
        matchingTransaction, 
        getActiveConfiguration: () => activeConfiguration, 
        setupConfigListeners  
    }
}