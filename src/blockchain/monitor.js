const { ethers } = require('ethers')


module.exports = ({logger, configManagerService}) => {
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
            blockchainLogger.error('Failed to initialize provider: ', err)
            throw err;
        }
    }

    async function startMonitoring(){
        try {
            if (!provider) {
                initProvider();
            }
            activeConfiguration = await configManagerService.loadActiveConfiguration()
            
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
        
        if (rules.minValue && BigInt(tx.value) > BigInt(rules.minValue)) {
            return true
        }

        return false
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
                        console.log('this passes: ', tx)
                    }
                }
            }
        }catch (err){
            blockchainLogger.error(`Failed to process block ${blockNumber} with error: ${err}`)
        }
    }

    return { startMonitoring }
}