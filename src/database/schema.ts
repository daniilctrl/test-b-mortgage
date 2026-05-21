
import { users } from '../app/modules/user/schemas/users';
import { mortgageProfiles } from '../app/modules/mortgage-profile/schemas/mortgage-profiles';
import { mortgageCalculations } from '../app/modules/mortgage-profile/schemas/mortgage-calculations';
import { MySql2Database } from 'drizzle-orm/mysql2';

export const databaseSchema = {
    users,
    mortgageProfiles,
    mortgageCalculations,
} as const;

export type Database = MySql2Database<typeof databaseSchema>;