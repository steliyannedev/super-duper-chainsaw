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
            configurationId: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: 'Configurations',
                    key: 'id'
                },
                onDelete: 'SET NULL'
            },
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
                allowNull: true
            },
            value: {
                type: DataTypes.STRING,
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
                type: DataTypes.DATE,
                allowNull: false
            }
        }
    )

    return Transaction;
}