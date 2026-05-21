import { PropertyType } from './schemas/mortgage-profiles';
import {
  MortgagePaymentSchedule,
  MortgagePayment
} from './mortgage-payment-schedule.types';

export interface CalculateMortgageInput {
  propertyPrice: number;
  propertyType: PropertyType;
  downPaymentAmount: number;
  matCapitalAmount: number | null;
  matCapitalIncluded: boolean;
  mortgageTermYears: number;
  interestRate: number;
}

export interface CalculateMortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalOverpaymentAmount: number;
  possibleTaxDeduction: number;
  savingsDueMotherCapital: number;
  recommendedIncome: number;
  paymentSchedule: MortgagePaymentSchedule;
}

function annuityMonthlyPayment(
  loanAmount: number,
  monthlyRate: number,
  totalMonths: number
): number {
  if (monthlyRate === 0) {
    return loanAmount / totalMonths;
  }
  const pow = Math.pow(1 + monthlyRate, totalMonths);
  return (loanAmount * monthlyRate * pow) / (pow - 1);
}

function buildSchedule(
  loanAmount: number,
  monthlyRate: number,
  monthlyPayment: number,
  totalMonths: number
): MortgagePaymentSchedule {
  const schedule: MortgagePaymentSchedule = {};
  const startDate = new Date();
  let balance = loanAmount;

  for (let i = 0; i < totalMonths; i++) {
    const isLast = i === totalMonths - 1;
    const interest = balance * monthlyRate;
    let principal = monthlyPayment - interest;
    if (isLast) {
      principal = balance;
    }
    balance = isLast ? 0 : balance - principal;

    const date = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + i + 1,
      1
    );
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1);

    const payment: MortgagePayment = {
      totalPayment: round2(isLast ? principal + interest : monthlyPayment),
      repaymentOfMortgageBody: round2(principal),
      repaymentOfMortgageInterest: round2(interest),
      mortgageBalance: round2(Math.max(balance, 0))
    };

    schedule[year] = schedule[year] ?? {};
    schedule[year][month] = payment;
  }

  return schedule;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateMortgage(
  input: CalculateMortgageInput
): CalculateMortgageResult {
  const matCapital = input.matCapitalIncluded
    ? input.matCapitalAmount ?? 0
    : 0;
  const loanAmount = input.propertyPrice - input.downPaymentAmount - matCapital;
  const totalMonths = input.mortgageTermYears * 12;
  const monthlyRate = input.interestRate / 12 / 100;

  const monthlyPayment = annuityMonthlyPayment(
    loanAmount,
    monthlyRate,
    totalMonths
  );
  const totalPayment = monthlyPayment * totalMonths;
  const totalOverpaymentAmount = totalPayment - loanAmount;

  const possibleTaxDeduction =
    Math.min(input.propertyPrice, 2_000_000) * 0.13 +
    Math.min(totalOverpaymentAmount, 3_000_000) * 0.13;

  let savingsDueMotherCapital = 0;
  if (input.matCapitalIncluded && matCapital > 0) {
    const loanWithout = input.propertyPrice - input.downPaymentAmount;
    const paymentWithout = annuityMonthlyPayment(
      loanWithout,
      monthlyRate,
      totalMonths
    );
    const totalWithout = paymentWithout * totalMonths;
    savingsDueMotherCapital = totalWithout - totalPayment;
  }

  const recommendedIncome = monthlyPayment * 2;

  const paymentSchedule = buildSchedule(
    loanAmount,
    monthlyRate,
    monthlyPayment,
    totalMonths
  );

  return {
    monthlyPayment: round2(monthlyPayment),
    totalPayment: round2(totalPayment),
    totalOverpaymentAmount: round2(totalOverpaymentAmount),
    possibleTaxDeduction: round2(possibleTaxDeduction),
    savingsDueMotherCapital: round2(savingsDueMotherCapital),
    recommendedIncome: round2(recommendedIncome),
    paymentSchedule
  };
}
