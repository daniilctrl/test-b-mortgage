import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MortgageProfileController } from './mortgage-profile.controller';
import { MortgageProfileService } from './mortgage-profile.service';
import {
  MortgageCalculationProcessor,
  MORTGAGE_CALCULATION_QUEUE
} from './mortgage-calculation.processor';

@Module({
  imports: [BullModule.registerQueue({ name: MORTGAGE_CALCULATION_QUEUE })],
  controllers: [MortgageProfileController],
  providers: [MortgageProfileService, MortgageCalculationProcessor]
})
export class MortgageProfileModule { }
