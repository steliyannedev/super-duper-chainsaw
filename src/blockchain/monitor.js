const { ethers } = require('ethers')


module.exports = ({logger}) => {
    // TODO: transaction service would probably be imported as param
    const blockchainLogger = logger('Blockchain')
    let provider;

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
            provider.on('block', async (blockNumber) =>  {
                await processBlock(blockNumber);
            })
            blockchainLogger.info('Monitoring on blockchain started')
        } catch (err){
            blockchainLogger.error(`Failed to start monitoring: ${err}`)
            throw err;
        }
    }

    async function processBlock(blockNumber){
        try {
            const block = await provider.getBlock(blockNumber, true)
            blockchainLogger.info(
                `Processing block ${blockNumber} with ${Array.from(block.transactions).length} transactions`
            )
            for (const tx of block.transactions){
                // TODO: check current config and apply rules to each tx
                // TODO: store tx that match rules in DB
                continue
            }
        }catch (err){
            blockchainLogger.error(`Failed to process block ${blockNumber} with error: ${err}`)
        }
    }

    return { startMonitoring }
}