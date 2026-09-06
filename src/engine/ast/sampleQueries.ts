export interface SampleQuery {
  id: string;
  name: string;
  category: string;
  dialect: 'postgresql' | 'mysql' | 'sqlite';
  sql: string;
  description: string;
}

export const sampleQueries: SampleQuery[] = [
  {
    id: 'user-case',
    name: 'Unindexed Filter & SELECT * (User Example)',
    category: 'Full Table Scan & Projections',
    dialect: 'postgresql',
    sql: `SELECT *
FROM Orders
JOIN Customers
ON Orders.CustomerId = Customers.Id
WHERE Customers.Country = 'Pakistan';`,
    description: 'Retrieves all columns across two tables while filtering on an unindexed Country column, causing a heavy sequential scan.',
  },
  {
    id: 'wildcard-like',
    name: 'Leading Wildcard Scan',
    category: 'Non-Sargable Predicates',
    dialect: 'postgresql',
    sql: `SELECT Id, Name, Email
FROM Customers
WHERE Email LIKE '%@gmail.com';`,
    description: 'Leading % wildcard prevents B-Tree index utilization, triggering a full table scan.',
  },
  {
    id: 'cartesian-product',
    name: 'Accidental Cross Join (Cartesian Risk)',
    category: 'Missing Join Condition',
    dialect: 'mysql',
    sql: `SELECT Orders.Id, Customers.Name
FROM Orders, Customers
WHERE Orders.Status = 'Pending';`,
    description: 'Comma join without explicit matching predicate results in an accidental Cartesian product (50k × 10k = 500M rows).',
  },
  {
    id: 'function-on-column',
    name: 'Function Call Wrapping Indexed Column',
    category: 'Non-Sargable Predicates',
    dialect: 'postgresql',
    sql: `SELECT Id, CustomerId, TotalAmount
FROM Orders
WHERE EXTRACT(YEAR FROM OrderDate) = 2024;`,
    description: 'Wrapping OrderDate in EXTRACT() invalidates standard B-Tree index scans. Can be rewritten to range condition.',
  },
];
