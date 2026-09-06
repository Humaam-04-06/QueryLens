import { SchemaCatalog } from '../types';

export const ecommerceSchema: SchemaCatalog = {
  id: 'ecommerce',
  name: 'E-Commerce Store (RetailDB)',
  description: 'Transactional store schema with orders, customers, and inventory',
  tables: [
    {
      name: 'Orders',
      rowCount: 50000,
      columns: [
        { name: 'Id', type: 'INT', nullable: false, isPrimaryKey: true },
        { name: 'CustomerId', type: 'INT', nullable: false },
        { name: 'OrderDate', type: 'DATETIME', nullable: false },
        { name: 'TotalAmount', type: 'DECIMAL(10,2)', nullable: false },
        { name: 'Status', type: 'VARCHAR(50)', nullable: false },
      ],
      existingIndexes: ['PRIMARY KEY (Id)'],
    },
    {
      name: 'Customers',
      rowCount: 10000,
      columns: [
        { name: 'Id', type: 'INT', nullable: false, isPrimaryKey: true },
        { name: 'Name', type: 'VARCHAR(100)', nullable: false },
        { name: 'Email', type: 'VARCHAR(150)', nullable: false },
        { name: 'Country', type: 'VARCHAR(60)', nullable: false },
        { name: 'City', type: 'VARCHAR(60)', nullable: true },
        { name: 'CreatedAt', type: 'DATETIME', nullable: false },
      ],
      existingIndexes: ['PRIMARY KEY (Id)'],
    },
    {
      name: 'OrderItems',
      rowCount: 150000,
      columns: [
        { name: 'Id', type: 'INT', nullable: false, isPrimaryKey: true },
        { name: 'OrderId', type: 'INT', nullable: false },
        { name: 'ProductId', type: 'INT', nullable: false },
        { name: 'Quantity', type: 'INT', nullable: false },
        { name: 'UnitPrice', type: 'DECIMAL(10,2)', nullable: false },
      ],
      existingIndexes: ['PRIMARY KEY (Id)', 'INDEX idx_orderitems_order (OrderId)'],
    },
  ],
};
