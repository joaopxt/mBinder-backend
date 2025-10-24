import { Module } from '@nestjs/common';
import { MostWantedModule } from '../most-wanted/most-wanted.module';
import { BestSellersModule } from '../best-sellers/best-sellers.module';
import { MetricsCronService } from './metrics-cron.service';

@Module({
  imports: [MostWantedModule, BestSellersModule],
  providers: [MetricsCronService],
})
export class MetricsCronModule {}
