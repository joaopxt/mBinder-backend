import { Module } from '@nestjs/common';
import { BestSellersService } from './best-sellers.service';
import { BestSellersController } from './best-sellers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BestSeller } from './entities/best-seller.entity';
import { Passe } from 'src/passe/entities/passe.entity';
import { Carta } from 'src/library/entities/library.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BestSeller, Passe, Carta])],
  controllers: [BestSellersController],
  providers: [BestSellersService],
  exports: [BestSellersService],
})
export class BestSellersModule {}
