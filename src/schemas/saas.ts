import { SchemaCatalog } from '../types';

export const saasSchema: SchemaCatalog = {
  id: 'saas',
  name: 'SaaS Multi-Tenant (CloudDB)',
  description: 'Multi-tenant subscription billing, audit trails, and workspace accounts',
  tables: [
    {
      name: 'Tenants',
      rowCount: 18000,
      columns: [
        { name: 'Id', type: 'UUID', nullable: false, isPrimaryKey: true },
        { name: 'OrganizationName', type: 'VARCHAR(120)', nullable: false },
        { name: 'PlanTier', type: 'VARCHAR(40)', nullable: false },
        { name: 'BillingCycle', type: 'VARCHAR(20)', nullable: false },
        { name: 'CreatedAt', type: 'TIMESTAMPTZ', nullable: false },
      ],
      existingIndexes: ['PRIMARY KEY (Id)'],
    },
    {
      name: 'Users',
      rowCount: 240000,
      columns: [
        { name: 'Id', type: 'UUID', nullable: false, isPrimaryKey: true },
        { name: 'TenantId', type: 'UUID', nullable: false },
        { name: 'Email', type: 'VARCHAR(180)', nullable: false },
        { name: 'Role', type: 'VARCHAR(30)', nullable: false },
        { name: 'IsActive', type: 'BOOLEAN', nullable: false },
        { name: 'LastLoginAt', type: 'TIMESTAMPTZ', nullable: true },
      ],
      existingIndexes: ['PRIMARY KEY (Id)', 'INDEX idx_users_tenant (TenantId)'],
    },
    {
      name: 'Invoices',
      rowCount: 450000,
      columns: [
        { name: 'Id', type: 'UUID', nullable: false, isPrimaryKey: true },
        { name: 'TenantId', type: 'UUID', nullable: false },
        { name: 'TotalAmount', type: 'DECIMAL(10,2)', nullable: false },
        { name: 'PaymentStatus', type: 'VARCHAR(30)', nullable: false },
        { name: 'DueDate', type: 'DATE', nullable: false },
      ],
      existingIndexes: ['PRIMARY KEY (Id)', 'INDEX idx_invoices_tenant (TenantId)'],
    },
    {
      name: 'AuditLogs',
      rowCount: 2800000,
      columns: [
        { name: 'Id', type: 'BIGINT', nullable: false, isPrimaryKey: true },
        { name: 'TenantId', type: 'UUID', nullable: false },
        { name: 'UserId', type: 'UUID', nullable: false },
        { name: 'Action', type: 'VARCHAR(100)', nullable: false },
        { name: 'IpAddress', type: 'VARCHAR(45)', nullable: false },
        { name: 'Timestamp', type: 'TIMESTAMPTZ', nullable: false },
      ],
      existingIndexes: ['PRIMARY KEY (Id)'],
    },
  ],
};
