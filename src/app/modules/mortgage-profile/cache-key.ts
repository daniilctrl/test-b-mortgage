import { createHash } from 'crypto';
import { CreateMortgageProfileDto } from './dto/create-mortgage-profile.dto';

export function buildCacheKey(input: CreateMortgageProfileDto): string {
  const normalized = {
    propertyPrice: Number(input.propertyPrice),
    propertyType: input.propertyType,
    downPaymentAmount: Number(input.downPaymentAmount),
    matCapitalAmount: input.matCapitalIncluded
      ? Number(input.matCapitalAmount ?? 0)
      : null,
    matCapitalIncluded: !!input.matCapitalIncluded,
    mortgageTermYears: Number(input.mortgageTermYears),
    interestRate: Number(input.interestRate)
  };
  const stable = JSON.stringify(normalized, Object.keys(normalized).sort());
  const hash = createHash('sha256').update(stable).digest('hex');
  return `mortgage:calc:v1:${hash}`;
}
