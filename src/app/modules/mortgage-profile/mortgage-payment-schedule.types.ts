export type MortgagePayment = {
  totalPayment: number;
  repaymentOfMortgageBody: number;
  repaymentOfMortgageInterest: number;
  mortgageBalance: number;
};

export type MonthlyMortgagePayments = {
  [month: string]: MortgagePayment;
};

export type MortgagePaymentSchedule = {
  [year: string]: MonthlyMortgagePayments;
};
