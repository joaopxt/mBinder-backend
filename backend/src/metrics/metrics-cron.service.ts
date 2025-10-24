import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MostWantedService } from '../most-wanted/most-wanted.service';
import { BestSellersService } from '../best-sellers/best-sellers.service';

@Injectable()
export class MetricsCronService implements OnModuleInit {
  private readonly logger = new Logger(MetricsCronService.name);
  private running = false;

  constructor(
    private readonly mostWanted: MostWantedService,
    private readonly bestSellers: BestSellersService,
  ) {}

  async onModuleInit() {
    // Atualiza uma vez ao iniciar a API
    await this.refreshTopLists();
  }

  // Executa diariamente às 03:00 (fuso de São Paulo) - PARAMÊTRO PARA EXECUTAR DIARIAMENTE: '0 3 * * *', { timeZone: 'America/Sao_Paulo' }
  @Cron('0 3 * * *', { timeZone: 'America/Sao_Paulo' })
  async dailyRefresh() {
    if (this.running) {
      this.logger.warn('Refresh already running, skipping this tick');
      return;
    }
    this.running = true;
    try {
      await this.refreshTopLists();
    } finally {
      this.running = false;
    }
  }

  private async refreshTopLists() {
    this.logger.log('Refreshing Most Wanted and Best Sellers...');
    try {
      await this.mostWanted.refreshFromWant(10);
      await this.bestSellers.refreshFromPasse(10);
      this.logger.log('Top lists refreshed successfully');
    } catch (e) {
      this.logger.error('Failed to refresh top lists', e as any);
    }
  }
}
