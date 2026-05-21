import {
  mysqlTable,
  int,
  varchar,
  decimal,
  text,
  timestamp
} from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { users } from '../../user/schemas/users';
import { mortgageProfiles } from './mortgage-profiles';

export const mortgageCalculations = mysqlTable('MortgageCalculations', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('userId', { length: 255 })
    .notNull()
    .references(() => users.tgId),
  mortgageProfileId: int('mortgageProfileId')
    .notNull()
    .references(() => mortgageProfiles.id),
  monthlyPayment: decimal('monthlyPayment', {
    precision: 20,
    scale: 2
  }).notNull(),
  totalPayment: decimal('totalPayment', { precision: 20, scale: 2 }).notNull(),
  totalOverpaymentAmount: decimal('totalOverpaymentAmount', {
    precision: 20,
    scale: 2
  }).notNull(),
  possibleTaxDeduction: decimal('possibleTaxDeduction', {
    precision: 20,
    scale: 2
  }).notNull(),
  savingsDueMotherCapital: decimal('savingsDueMotherCapital', {
    precision: 20,
    scale: 2
  }).notNull(),
  recommendedIncome: decimal('recommendedIncome', {
    precision: 20,
    scale: 2
  }).notNull(),
  paymentSchedule: text('paymentSchedule').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull()
});

export type MortgageCalculation = InferSelectModel<typeof mortgageCalculations>;
export type NewMortgageCalculation = InferInsertModel<
  typeof mortgageCalculations
>;
