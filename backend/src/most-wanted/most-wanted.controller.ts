import { Controller, Get, Post, Query } from '@nestjs/common';
import { MostWantedService } from './most-wanted.service';

@Controller('most-wanted')
export class MostWantedController {
  constructor(private readonly mostWantedService: MostWantedService) {}

  @Get()
  async findTop(@Query('limit') limit?: string) {
    const take = limit ? Number(limit) : 10;
    const list = await this.mostWantedService.findTop(take);
    if (!list.length) {
      return this.mostWantedService.refreshFromWant(take);
    }
    return list;
  }

  @Post('refresh')
  refresh(@Query('limit') limit?: string) {
    return this.mostWantedService.refreshFromWant(limit ? Number(limit) : 10);
  }
}
