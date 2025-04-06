const { ethers } = require('ethers')


module.exports = ({logger, configManagerService, transaction}) => {
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

    async function storeTransaction(tx, configId, timestamp) {
        try {
            // TODO: check for another way to fetch gasUsed, for looser rules with many matched tx
            //  we might get rate limited
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

    return { startMonitoring }
}