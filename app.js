const { Sequelize } = require('sequelize')
const { ethers } = require('ethers')

const sequelize = new Sequelize('postgresql://user:password@localhost:5432/mydatabase')
const provider = new ethers.InfuraProvider('mainnet', '')
// testing DB connection
async function testDatabaseConnection() {
    try {
        await sequelize.authenticate()
        console.log('Connection established')
    } catch (err) {
        console.error('Error encountered: ', err)
    } finally {
        sequelize.close()
    }
}
// testing infura connection
async function testInfuraConnection() {
    try {
        const blockNumber = await provider.getBlockNumber()
        console.log('Block number is: ', blockNumber)
    } catch (err) {
        console.log('Infura connection error ', err )
    }
}

testInfuraConnection()
testDatabaseConnection()