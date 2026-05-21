import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post
} from '@nestjs/common';
import { MortgageProfileService } from './mortgage-profile.service';
import { CreateMortgageProfileDto } from './dto/create-mortgage-profile.dto';

@Controller('mortgage-profiles')
export class MortgageProfileController {
  constructor(private readonly service: MortgageProfileService) {}

  @Post()
  async create(
    @Body() dto: CreateMortgageProfileDto,
    @Headers('x-user-id') userId: string
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.service.create(userId, dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
