import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Queue } from 'bull';
import { eq } from 'drizzle-orm';
import { Database } from '../../../database/schema';
import {
  mortgageProfiles,
  PROPERTY_TYPES
} from './schemas/mortgage-profiles';
import { mortgageCalculations } from './schemas/mortgage-calculations';
import { CreateMortgageProfileDto } from './dto/create-mortgage-profile.dto';
import {
  CalculateMortgageInput,
  CalculateMortgageResult
} from './calculate-mortgage';
import { MortgagePaymentSchedule } from './mortgage-payment-schedule.types';
import { buildCacheKey } from './cache-key';
import {
  MORTGAGE_CALCULATION_JOB,
  MORTGAGE_CALCULATION_QUEUE
} from './mortgage-calculation.processor';

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class MortgageProfileService {
  constructor(
    @Inject('DATABASE') private readonly db: Database,
    @InjectQueue(MORTGAGE_CALCULATION_QUEUE)
    private readonly queue: Queue<CalculateMortgageInput>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache
  ) {}

  async create(userId: string, dto: CreateMortgageProfileDto) {
    this.validate(dto);

    const matCapital = dto.matCapitalIncluded
      ? dto.matCapitalAmount ?? 0
      : 0;
    const loanAmount = dto.propertyPrice - dto.downPaymentAmount - matCapital;
    if (loanAmount <= 0) {
      throw new BadRequestException('Down payment exceeds property price');
    }

    const input: CalculateMortgageInput = {
      propertyPrice: dto.propertyPrice,
      propertyType: dto.propertyType,
      downPaymentAmount: dto.downPaymentAmount,
      matCapitalAmount: dto.matCapitalAmount ?? null,
      matCapitalIncluded: dto.matCapitalIncluded,
      mortgageTermYears: dto.mortgageTermYears,
      interestRate: dto.interestRate
    };

    const cacheKey = buildCacheKey(dto);
    let result = await this.cache.get<CalculateMortgageResult>(cacheKey);

    if (!result) {
      const job = await this.queue.add(MORTGAGE_CALCULATION_JOB, input);
      result = (await job.finished()) as CalculateMortgageResult;
      await this.cache.set(cacheKey, result, CACHE_TTL_MS);
    }

    const profileId = await this.db.transaction(async tx => {
      const [insertProfile] = await tx.insert(mortgageProfiles).values({
        userId,
        propertyPrice: String(dto.propertyPrice),
        propertyType: dto.propertyType,
        downPaymentAmount: String(dto.downPaymentAmount),
        matCapitalAmount:
          dto.matCapitalAmount != null ? String(dto.matCapitalAmount) : null,
        matCapitalIncluded: dto.matCapitalIncluded,
        mortgageTermYears: dto.mortgageTermYears,
        interestRate: String(dto.interestRate)
      });

      const id = Number(insertProfile.insertId);

      await tx.insert(mortgageCalculations).values({
        userId,
        mortgageProfileId: id,
        monthlyPayment: String(result!.monthlyPayment),
        totalPayment: String(result!.totalPayment),
        totalOverpaymentAmount: String(result!.totalOverpaymentAmount),
        possibleTaxDeduction: String(result!.possibleTaxDeduction),
        savingsDueMotherCapital: String(result!.savingsDueMotherCapital),
        recommendedIncome: String(result!.recommendedIncome),
        paymentSchedule: JSON.stringify(result!.paymentSchedule)
      });

      return id;
    });

    return { id: String(profileId) };
  }

  async findOne(rawId: string) {
    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('Invalid mortgage profile id');
    }

    const [row] = await this.db
      .select()
      .from(mortgageCalculations)
      .where(eq(mortgageCalculations.mortgageProfileId, id));

    if (!row) {
      throw new NotFoundException('Mortgage calculation not found');
    }

    return {
      monthlyPayment: row.monthlyPayment,
      totalPayment: row.totalPayment,
      totalOverpaymentAmount: row.totalOverpaymentAmount,
      possibleTaxDeduction: row.possibleTaxDeduction,
      savingsDueMotherCapital: row.savingsDueMotherCapital,
      recommendedIncome: row.recommendedIncome,
      mortgagePaymentSchedule: JSON.parse(
        row.paymentSchedule
      ) as MortgagePaymentSchedule
    };
  }

  private validate(dto: CreateMortgageProfileDto) {
    const isNum = (v: unknown) => typeof v === 'number' && Number.isFinite(v);

    if (!isNum(dto.propertyPrice) || dto.propertyPrice <= 0) {
      throw new BadRequestException('propertyPrice must be > 0');
    }
    if (!isNum(dto.downPaymentAmount) || dto.downPaymentAmount < 0) {
      throw new BadRequestException('downPaymentAmount must be >= 0');
    }
    if (
      dto.matCapitalAmount != null &&
      (!isNum(dto.matCapitalAmount) || dto.matCapitalAmount < 0)
    ) {
      throw new BadRequestException('matCapitalAmount must be >= 0');
    }
    if (
      !Number.isInteger(dto.mortgageTermYears) ||
      dto.mortgageTermYears < 1 ||
      dto.mortgageTermYears > 50
    ) {
      throw new BadRequestException('mortgageTermYears must be 1..50');
    }
    if (!isNum(dto.interestRate) || dto.interestRate < 0 || dto.interestRate > 100) {
      throw new BadRequestException('interestRate must be 0..100');
    }
    if (!PROPERTY_TYPES.includes(dto.propertyType)) {
      throw new BadRequestException('Invalid propertyType');
    }
  }
}
