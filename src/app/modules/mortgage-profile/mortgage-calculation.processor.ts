import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import {
  calculateMortgage,
  CalculateMortgageInput,
  CalculateMortgageResult
} from './calculate-mortgage';

export const MORTGAGE_CALCULATION_QUEUE = 'mortgage-calculation';
export const MORTGAGE_CALCULATION_JOB = 'compute';

@Processor(MORTGAGE_CALCULATION_QUEUE)
export class MortgageCalculationProcessor {
  @Process(MORTGAGE_CALCULATION_JOB)
  async compute(
    job: Job<CalculateMortgageInput>
  ): Promise<CalculateMortgageResult> {
    return calculateMortgage(job.data);
  }
}
