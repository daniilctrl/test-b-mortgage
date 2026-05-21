import { PropertyType } from '../schemas/mortgage-profiles';

export class CreateMortgageProfileDto {
  propertyPrice: number;
  propertyType: PropertyType;
  downPaymentAmount: number;
  matCapitalAmount: number | null;
  matCapitalIncluded: boolean;
  mortgageTermYears: number;
  interestRate: number;
}
