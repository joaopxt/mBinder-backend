import { Controller, Get, Post, Query } from '@nestjs/common';
import { BestSellersService } from './best-sellers.service';

@Controller('best-sellers')
export class BestSellersController {
  constructor(private readonly bestSellersService: BestSellersService) {}

  @Get()
  async findTop(@Query('limit') limit?: string) {
    const take = limit ? Number(limit) : 10;
    const list = await this.bestSellersService.findTop(take);
    if (!list.length) {
      return this.bestSellersService.refreshFromPasse(take);
    }
    return list;
  }

  @Post('refresh')
  refresh(@Query('limit') limit?: string) {
    return this.bestSellersService.refreshFromPasse(limit ? Number(limit) : 10);
  }
}
