import { SchemaCatalog } from '../types';
import { ecommerceSchema } from './ecommerce';
import { fintechSchema } from './fintech';
import { saasSchema } from './saas';

export const defaultSchemas: SchemaCatalog[] = [
  ecommerceSchema,
  fintechSchema,
  saasSchema,
];

export { ecommerceSchema, fintechSchema, saasSchema };
