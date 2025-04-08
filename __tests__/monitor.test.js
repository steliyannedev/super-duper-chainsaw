const container = require('../container')


describe('Monitor', () => {
    let monitor;

    beforeAll(() => {
        monitor = container.resolve('startMonitoring')
    })
    
    describe('matchingTransaction', () => {
        test('should match transactions to specific address', () => {
            const tx = {
                hash: '0x123',
                from: '0xabc',
                to: '0xdef',
                value: '1000000000000000000'
            }
            const config = {
                rules: {
                    toAddress: '0xdef'
                }
            }

            expect(monitor.matchingTransaction(tx, config)).toBe(true)
        })

        test('should match contract creation transactions', () => {
            const tx = {
                hash: '0x123',
                from: '0xabc',
                to: null,
                value: '1000000000000000000'
            }
            const config = {
                rules: {
                    toAddress: '0x'
                }
            }

            expect(monitor.matchingTransaction(tx, config)).toBe(true)
        })
    })
})
