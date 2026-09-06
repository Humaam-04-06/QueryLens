import { SchemaCatalog } from '../types';

export const fintechSchema: SchemaCatalog = {
  id: 'fintech',
  name: 'FinTech Ledger (FinTechDB)',
  description: 'High-throughput transactional banking, accounts, and fraud detection catalog',
  tables: [
    {
      name: 'Transactions',
      rowCount: 1200000,
      columns: [
        { name: 'Id', type: 'BIGINT', nullable: false, isPrimaryKey: true },
        { name: 'AccountId', type: 'BIGINT', nullable: false },
        { name: 'MerchantId', type: 'BIGINT', nullable: false },
        { name: 'Amount', type: 'DECIMAL(12,2)', nullable: false },
        { name: 'Currency', type: 'VARCHAR(3)', nullable: false },
        { name: 'Status', type: 'VARCHAR(20)', nullable: false },
        { name: 'CreatedAt', type: 'TIMESTAMP', nullable: false },
      ],
      existingIndexes: ['PRIMARY KEY (Id)', 'INDEX idx_tx_account (AccountId)'],
    },
    {
      name: 'Accounts',
      rowCount: 85000,
      columns: [
        { name: 'Id', type: 'BIGINT', nullable: false, isPrimaryKey: true },
        { name: 'UserId', type: 'BIGINT', nullable: false },
        { name: 'AccountType', type: 'VARCHAR(30)', nullable: false },
        { name: 'Balance', type: 'DECIMAL(14,2)', nullable: false },
        { name: 'Status', type: 'VARCHAR(20)', nullable: false },
      ],
      existingIndexes: ['PRIMARY KEY (Id)', 'INDEX idx_acc_user (UserId)'],
    },
    {
      name: 'Merchants',
      rowCount: 14000,
      columns: [
        { name: 'Id', type: 'BIGINT', nullable: false, isPrimaryKey: true },
        { name: 'BusinessName', type: 'VARCHAR(150)', nullable: false },
        { name: 'CategoryCode', type: 'VARCHAR(10)', nullable: false },
        { name: 'Country', type: 'VARCHAR(60)', nullable: false },
      ],
      existingIndexes: ['PRIMARY KEY (Id)'],
    },
    {
      name: 'FraudAlerts',
      rowCount: 32000,
      columns: [
        { name: 'Id', type: 'BIGINT', nullable: false, isPrimaryKey: true },
        { name: 'TransactionId', type: 'BIGINT', nullable: false },
        { name: 'RiskScore', type: 'INT', nullable: false },
        { name: 'ReviewStatus', type: 'VARCHAR(30)', nullable: false },
        { name: 'FlaggedAt', type: 'TIMESTAMP', nullable: false },
      ],
      existingIndexes: ['PRIMARY KEY (Id)', 'INDEX idx_fraud_tx (TransactionId)'],
    },
  ],
};
