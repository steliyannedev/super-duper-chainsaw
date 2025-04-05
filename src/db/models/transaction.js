const { DataTypes } = require('sequelize')

module.exports = ({sequelize}) => {
    const Transaction = sequelize.define(
        'Transaction',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            // TODO: ConfigId
            transactionHash: {
                type: DataTypes.STRING,
                allowNull: false
            },
            blockNumber: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            fromAddress: {
                type: DataTypes.STRING,
                allowNull: false
            },
            toAddress: {
                type: DataTypes.STRING,
                allowNull: false
            },
            value: {
                type: DataTypes.BIGINT,
                allowNull: false
            },
            gasUsed: {
                type: DataTypes.STRING,
                allowNull: false
            },
            data: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            timestamp: {
                type: DataTypes.TIME,
                allowNull: false
            },
            rawData: {
                type: DataTypes.JSON,
                allowNull: false
            }
        }
    )

    return Transaction;
}