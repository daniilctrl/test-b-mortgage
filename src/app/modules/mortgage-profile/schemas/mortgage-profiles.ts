import {
  mysqlTable,
  int,
  varchar,
  decimal,
  boolean,
  mysqlEnum,
  timestamp
} from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { users } from '../../user/schemas/users';

export const PROPERTY_TYPES = [
  'apartment_in_new_building',
  'apartment_in_secondary_building',
  'house',
  'house_with_land_plot',
  'land_plot',
  'other'
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const mortgageProfiles = mysqlTable('MortgageProfiles', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('userId', { length: 255 })
    .notNull()
    .references(() => users.tgId),
  propertyPrice: decimal('propertyPrice', { precision: 20, scale: 2 }).notNull(),
  propertyType: mysqlEnum('propertyType', PROPERTY_TYPES).notNull(),
  downPaymentAmount: decimal('downPaymentAmount', {
    precision: 20,
    scale: 2
  }).notNull(),
  matCapitalAmount: decimal('matCapitalAmount', { precision: 20, scale: 2 }),
  matCapitalIncluded: boolean('matCapitalIncluded').notNull(),
  mortgageTermYears: int('mortgageTermYears').notNull(),
  interestRate: decimal('interestRate', { precision: 6, scale: 3 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull()
});

export type MortgageProfile = InferSelectModel<typeof mortgageProfiles>;
export type NewMortgageProfile = InferInsertModel<typeof mortgageProfiles>;
